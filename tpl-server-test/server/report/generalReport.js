const pool = require('../database/pooling');

const total_entry_history = async (usr_id) => {
  const query_entry = await pool.query(`SELECT count(id) as total_entry FROM history WHERE usr_id = $1`, [usr_id]);
  const total_entry = parseInt(query_entry.rows[0].total_entry);
  return total_entry;
}

const total_km_driven = async (usr_id) => {
  //Find the 2 forms which are the first and the latest form in the history table
  
  const extract_odometer = (one_form) => {
    const {type_of_form, id_private_form} = one_form;
    if(type_of_form === 'napnhienlieu') return pool.query(`SELECT odometer from napnhienlieu where id = $1`, [id_private_form]);
    if(type_of_form === 'chiphi') return pool.query(`SELECT odometer from chiphi where id = $1`, [id_private_form]);
    if(type_of_form === 'dichvu') return pool.query(`SELECT odometer from dichvu where id = $1`, [id_private_form]);
    if(type_of_form === 'thunhap') return pool.query(`SELECT odometer from thunhap where id = $1`, [id_private_form]);
    // if(type_of_form === 'quangduong') return pool.query(`SELECT final_odometer as odometer from quangduong where id = $1`, [id_private_form]);
    throw new Error('invalid type_of_form');
  }

  const query1 = await pool.query(`
    SELECT min(created_at_date) as start_date, max(created_at_date) as current_date 
    FROM history
    WHERE usr_id = $1
  `,[usr_id]);
   const {start_date, current_date} = query1.rows[0];
  
   const query2 = await pool.query(`
  (SELECT id_private_form, type_of_form, created_at_date, created_at_time 
   FROM history
   WHERE        (usr_id = $1)
          AND   (created_at_date = $2)
          AND   (created_at_time = ( SELECT min(created_at_time) 
                                    FROM history 
                                    WHERE usr_id = $1 AND created_at_date = $2 AND type_of_form NOT IN ($4)
                                  )) 
          AND (type_of_form NOT IN ($4))
  )
    UNION
  (SELECT id_private_form, type_of_form, created_at_date, created_at_time
    FROM history
    WHERE        (usr_id = $1)
          AND   (created_at_date = $3)
          AND   (created_at_time = ( SELECT max(created_at_time) 
                                    FROM history 
                                    WHERE usr_id = $1 AND created_at_date = $3 AND type_of_form NOT IN ($4)
                                  ))   
          AND (type_of_form NOT IN ($4))    
  ) 
  ORDER BY created_at_date ASC, created_at_time ASC`
   ,[usr_id, start_date, current_date, 'quangduong']);
   
   const _array_contains_2_dates = query2.rows;

   const _array_contains_2_odometers = await Promise.all(_array_contains_2_dates.map(extract_odometer));

   const _2_odometers = _array_contains_2_odometers.map((each_row) => each_row.rows[0].odometer);

   const km_driven = parseFloat(_2_odometers[1]) - parseFloat(_2_odometers[0]);

   return {km_driven, start_date, current_date};
}

const total_date_app_used = async (usr_id) => {
  
  const query1 = await pool.query(`
  SELECT min(created_at_date) as start_date, max(created_at_date) as current_date
  FROM history
  WHERE usr_id = $1`, [usr_id]);
  const start_date = query1.rows[0].start_date;
  const current_date = query1.rows[0].current_date;

  const query2 = await pool.query(`
  SELECT DATE_PART('day', $2::timestamp - $1::timestamp)`, [start_date, current_date]);
  const date_diff = query2.rows[0].date_part;
  return date_diff;
}

const total_cost_all_form = async (usr_id) => {
  //napnhienlieu
  let cost_nll = 0, cost_chiphi = 0, cost_dichvu = 0;

  const queryNLL = await pool.query(` SELECT sum(total_cost) as total_cost FROM napnhienlieu WHERE u_id = $1`, [usr_id]);

  const queryChiphi = await pool.query(` SELECT sum(amount) as total_cost FROM chiphi WHERE u_id = $1`, [usr_id]);

  const queryDichvu = await pool.query(` SELECT sum(amount) as total_cost FROM dichvu WHERE u_id = $1`, [usr_id]);

  
  queryNLL.rows[0].total_cost === null ? cost_nll = 0 : cost_nll = parseInt(queryNLL.rows[0].total_cost);

  queryChiphi.rows[0].total_cost === null ? cost_chiphi = 0 : cost_chiphi = parseInt(queryChiphi.rows[0].total_cost);

  queryDichvu.rows[0].total_cost === null ? cost_dichvu = 0 : cost_dichvu = parseInt(queryDichvu.rows[0].total_cost);

  const total_cost = cost_nll + cost_chiphi + cost_dichvu;
  
  return total_cost;
}

const total_income_all_form = async (usr_id) => {
  let total_income = 0;
  const query1 = await pool.query(` SELECT sum(amount) as total_income  FROM thunhap WHERE u_id = $1`, [usr_id]);
  // if(query1.rowCount === 0) {total_income = 0} else {
  //   const income_value_array = query1.rows.map((each_row) => each_row.total_cost);
  //   total_income = income_value_array.reduce((total, value) => total + value);
  // }
  query1.rows[0].total_income === null ? total_income = 0 : total_income = parseInt(query1.rows[0].total_income);
  return total_income;
}

const today = async () => {
  const query1 = await pool.query(`
  SELECT date_trunc('day', now()) as today`);
  return query1.rows[0].today;
}

module.exports = {
    print_general: async (usr_id) => {

      const total_entry = await total_entry_history(usr_id);

      if (total_entry === 0) { // Neu nguoi dung chua nhap bat ky 1 form gi
        return {
          total_entry: 0,
          dates: {
            start_date: await today(),
            current_date: await today(),
          },
          Balance: {
            total_balance: 0, by_day: 0.000, by_km: 000,
          },
          Cost: {
            total_cost: 0, by_day: 0.000, by_km: 0.000
          },
          Income: {
            total_income: 0,
            by_day: 0.000,
            by_km: 0.000,
          },
          Distance: {
            total: 0,
            daily_average: 0.000,
          }
        }
      } 
      const {start_date, current_date, km_driven} = await total_km_driven(usr_id);


      // Calculate total_date_app_used
      date_diff = await total_date_app_used(usr_id);

      //5 gia tri chinh: total_entry, total_cost, total_income, date_diff, km_driven

      // calculate total cost of (NLL, CHIPHI, DICHVU) TABLES
      const total_cost = await total_cost_all_form(usr_id);

      //Calculate total income from INCOME TABLE
      const total_income = await total_income_all_form(usr_id);

      // Calculate balanced sheet
      const total_balance = total_cost - total_income;

      return {
        total_entry, // gia tri dau tien duoc tinh toan
        dates: {
          start_date,
          current_date,
        },
        Balance: {
          total_balance,
          by_day: parseFloat((total_balance / date_diff).toFixed(3)),
          by_km: parseFloat((total_balance / km_driven).toFixed(3)),
        },
        Cost: {
          total_cost,
          by_day: parseFloat((total_cost / date_diff).toFixed(3)),
          by_km: parseFloat((total_cost / km_driven).toFixed(3)),
        },
        Income: {
          total_income,
          by_day: parseFloat((total_income / date_diff).toFixed(3)),
          by_km: parseFloat((total_income / km_driven).toFixed(3)),
        },
        Distance: {
          total: km_driven,
          daily_average: Math.floor(km_driven / date_diff),
        }
      }
    },

}