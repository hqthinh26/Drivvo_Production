const pool = require(`../database/pooling`);
const { parse } = require("path");

const find_number_of_entry = async (usr_id) => {
    const query1 = await pool.query(`select count(id) as total from thunhap`);
    const entry_number = query1.rows[0].total;
    return entry_number;
}

const oldest_lastest_time_date_history = async (usr_id) => {
    const query1 = await pool.query(`select min(created_at_date) as min, max(created_at_date) as max
                                from history
                                where usr_id = $1`, [usr_id]);
    const start_date = query1.rows[0].min;
    const current_date = query1.rows[0].max;
    const query3 = await pool.query(`SELECT DATE_PART('day', $1::timestamp - $2::timestamp)`,[current_date,start_date]);
    const date_diff = query3.rows[0].date_part;
    
    return {start_date, current_date, date_diff};
};

const get_odometer_value =  (one_history_form) => {
    const {type_of_form, id_private_form} = one_history_form;
    
    if(type_of_form === 'napnhienlieu')
        return pool.query(`select odometer from napnhienlieu where id = $1`,[id_private_form]);
    if(type_of_form === 'chiphi')
        return pool.query(`select odometer from chiphi where id = $1`, [id_private_form]);
    if(type_of_form === 'dichvu')
        return pool.query(`select odometer from dichvu where id = $1`, [id_private_form]);
    if(type_of_form === 'thunhap')
        return pool.query(`select odometer from thunhap where id = $1`, [id_private_form]);
    if(type_of_form === 'quangduong')
        return pool.query(`select final_odometer from quangduong where id = $1`, [id_private_form]);
}

const total_money_spent = async (usr_id) => {
    const query1 = await pool.query(`select amount from thunhap where u_id = $1`, [usr_id]);
    const amount_array = query1.rows;

    let total = 0;
    for(let i = 0; i < amount_array.length; i++) {
        total = total + amount_array[i].amount;
    }
    return total;
}

const total_km_driven = async (usr_id, start_date, current_date) =>  {
    try {
        const query2 = await pool.query(`
        (SELECT type_of_form, id_private_form, created_at_date
        FROM history
        WHERE (usr_id = $1) AND (created_at_date = $2) AND (created_at_time = (SELECT min(created_at_time)
                                                                                FROM history
                                                                                WHERE (usr_id = $1) AND (created_at_date = $2)))
        )
        UNION
        (SELECT type_of_form, id_private_form, created_at_date
        FROM history
        WHERE (usr_id = $1) AND (created_at_date = $3) AND (created_at_time = (SELECT max(created_at_time) 
                                                                                FROM history 
                                                                                WHERE (usr_id = $1) AND (created_at_date = $3)))
        )
        ORDER BY created_at_date ASC
        `, [usr_id, start_date, current_date]);

        if(query2.rowCount !== 2) throw new Error('Return more than 2 rows in oldest_lastest forms for odometer diff');
        
        const oldest_latest_time_date_history_forms = query2.rows;

        const _2_value_odometer_promises = await Promise.all(
            oldest_latest_time_date_history_forms.map( (one_history_form) => 
                get_odometer_value(one_history_form)
            )
        )   
        const _2_value_odometers = _2_value_odometer_promises.map((each_promise_value) => each_promise_value.rows[0].odometer);
        const km_driven = parseFloat(_2_value_odometers[1]) - parseFloat(_2_value_odometers[0]);
        console.log(typeof(km_driven));
        return km_driven;
        
    } catch (err) {
        console.log({Err: err})
    }
    
}
    

module.exports = {
    print_report: async (usr_id) => {
        try {
            const entry_number = await find_number_of_entry(usr_id);
            const {start_date, current_date, date_diff} = await oldest_lastest_time_date_history(usr_id);
            const km_driven = await total_km_driven(usr_id, start_date, current_date);
            const total_money_spentX = await total_money_spent(usr_id);
            const by_km = parseFloat(((total_money_spentX / km_driven).toFixed(3)));
            const by_day = parseFloat(((total_money_spentX / date_diff).toFixed(3)));
            /*return {
                entry_number,
                start_date,
                current_date,
                date_diff,
                km_driven,
                total_money_spentX,
                by_km,
                by_day
            };*/

            return {
                entry: {
                    entry_thunhap: entry_number,
                    start_date,
                    current_date,
                    date_diff,
                },
                statistic: {
                    total_money: total_money_spentX,
                    by_day,
                    by_km
                }
            };
        } catch (err) {
            throw new Error(err);
        }
        
    }
};


