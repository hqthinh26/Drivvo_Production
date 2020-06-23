const pool = require('../database/pooling');
const { query } = require('../database/pooling');
const { _return_detail_each_form } = require('../database/historyMethod');


//perform computation on history table
//Step 1: count the number of rows

const count_row_in_table = async (usr_id) => {
    const query = await pool.query(`SELECT count(id) as total from chiphi`);
    const total_row = parseInt(query.rows[0].total);
    return total_row;
}


//For the entry | Date_diff helps to compute by_day
get_start_day_and_current_day = async (usr_id) => {
    const query1 = await pool.query(`SELECT min(created_at_date) as min, max(created_at_date) as max
                                    FROM history
                                    WHERE usr_id = $1`, [usr_id]);
    const start_date = query1.rows[0].min;
    const current_date = query1.rows[0].max;

    const query2 = await pool.query(`SELECT DATE_PART('day', $1::timestamp - $2::timestamp) `, [current_date, start_date]);
    const date_diff = query2.rows[0].date_part;

    return {start_date, current_date, date_diff};
}

// for the statistic | total money spent on chiphi reasons
const total_money_spent = async (usr_id) => {
    const query1 = await pool.query(`SELECT odometer FROM chiphi WHERE u_id = $1`, [usr_id]);
    const array_of_chiphi = query1.rows;

    let total_money = 0.0;
    for(let i=0; i < query1.rowCount; i++) {
        total_money = total_money + parseFloat(array_of_chiphi[i].odometer);
    }
    return {total_money};
}

const extract_odometer_value = async (a_form_value) => {
    const {type_of_form, id_private_form} = a_form_value;

    if(type_of_form === 'napnhienlieu'){
        console.log('this is nll')
        return pool.query(`select odometer from napnhienlieu where id = $1`, [id_private_form])
    }
    if(type_of_form === 'chiphi') {

    }
    if(type_of_form === 'dichvu') {

    }
    if(type_of_form === 'thunhap') {
        console.log('this is thu nhap')
        return pool.query(`select odometer from thunhap where id = $1`, [id_private_form]);
    }
    if(type_of_form === 'quangduong') {

    }
    if(type_of_form === 'nhacnho') {

    }
    return console.log('wrong type_of_form in extract_odometer_value')

}

//For statistic | count total_km_driven to compute by_km
const total_km_driven = async (usr_id) => {
    const {start_date, current_date} = await get_start_day_and_current_day(usr_id);

    const query1 = await pool.query(`
        (SELECT type_of_form, id_private_form, created_at_date
        FROM history 
        WHERE           (usr_id = $1) 
                AND     (created_at_date = $2) 
                AND     (created_at_time = (SELECT min(created_at_time) 
                                            FROM history 
                                            WHERE usr_id = $1 AND created_at_date = $2)
                        )
        )
        UNION
        (SELECT type_of_form, id_private_form, created_at_date
        FROM history
        WHERE           (usr_id = $1)
                AND     (created_at_date = $3)
                AND     (created_at_time = (SELECT max(created_at_time) 
                                            FROM history 
                                            WHERE usr_id = $1 AND created_at_date = $3)
                        )
        )
        ORDER BY created_at_date ASC
        `, [usr_id, start_date, current_date]
    );

    const oldest_and_lastest_forms_of_history = query1.rows;
   
    const array_of_oldest_latest_odometer = await Promise.all(oldest_and_lastest_forms_of_history.map((each_form) => extract_odometer_value(each_form)))

    const _2_odometers = array_of_oldest_latest_odometer.map((each_query_value) => parseFloat(each_query_value.rows[0].odometer))

    const total_km_driven_value = _2_odometers[1] - _2_odometers[0];
    
    //return oldest_and_lastest_forms_of_history;
    //return array_of_oldest_latest_odometer;
    return total_km_driven_value;
}


module.exports = {
    print_report: async (usr_id) => {

        const entry_chiphi = await count_row_in_table(usr_id);
        const {start_date, current_date, date_diff} = await get_start_day_and_current_day(usr_id);
        //Get number of rows in chiphi table + CHECK

        //Get start_day and current_day in history table + CHECK

        //Count total_cost   & by_day_cost and finally by km_cost (IN PROGRESS)
        //Step 1: count total_cost CHECK
        const {total_money} = await total_money_spent(usr_id);

        //Step 2: count the DATE DIFF between first day and last day to count BY_DAY (in history table)  CHECK
        const by_day_cost = parseFloat((total_money / date_diff).toFixed(3));

        //Step 3: count the ODOMETER DIFF  between first day and last day to count by_km (in history table)
        const km_driven = await total_km_driven(usr_id);

        const by_km = parseFloat((total_money / km_driven).toFixed(3));
        return {
            entry: {
                entry_chiphi,
                start_date,
                current_date,
                date_diff
            },
            statistics: {
                total_money,
                by_day_cost,
                by_km,
            }
            
        }
    }
}