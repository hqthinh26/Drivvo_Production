const pool = require('../database/pooling');
//perform computation on history table
//Step 1: count the number of rows

const count_row_in_table = async (usr_id) => {
    const query = await pool.query(`SELECT count(id) as total from chiphi where u_id = $1`,[usr_id]);
    const total_row = parseInt(query.rows[0].total);
    return total_row;
}


//For the entry | Date_diff helps to compute by_day
const get_start_day_and_current_day = async (usr_id) => {
    const query1 = await pool.query(`SELECT min(created_at_date) as min, max(created_at_date) as max
                                    FROM history
                                    WHERE usr_id = $1`, [usr_id]);
    const start_date = query1.rows[0].min;
    const current_date = query1.rows[0].max;

    const query2 = await pool.query(`SELECT DATE_PART('day', $1::timestamp - $2::timestamp) `, [current_date, start_date]);
    let date_diff = query2.rows[0].date_part;
    date_diff === 0 ? date_diff = 1 : date_diff = date_diff;

    return {start_date, current_date, date_diff};
}

// for the statistic | total money spent on chiphi reasons
const total_money_spent = async (usr_id) => {
    const query1 = await pool.query(`SELECT sum(amount) as total_money FROM chiphi WHERE u_id = $1`, [usr_id]);
    return parseFloat(query1.rows[0].total_money);
}

//to get the total_km driven by the user - regardless of what type_of_forms
const extract_odometer_value = async (a_form_value) => {
    const {type_of_form, id_private_form} = a_form_value;

    if(type_of_form === 'napnhienlieu'){
        return pool.query(`select odometer from napnhienlieu where id = $1`, [id_private_form])
    }
    if(type_of_form === 'chiphi') {
        return pool.query(`select odometer from chiphi where id = $1`, [id_private_form]);
    }
    if(type_of_form === 'dichvu') {
        return pool.query(`select odometer from dichvu where id = $1`, [id_private_form]);
    }
    if(type_of_form === 'thunhap') {
        return pool.query(`select odometer from thunhap where id = $1`, [id_private_form]);
    }
    if(type_of_form === 'quangduong') {
        return pool.query(`select final_odometer as odometer from quangduong where id = $1`, [id_private_form]);
    }
    return console.log('wrong type_of_form in extract_odometer_value')

}

//For statistic | count total_km_driven to compute by_km
const total_km_driven = async (usr_id) => {
    try {
        const {start_date, current_date} = await get_start_day_and_current_day(usr_id);

        const query1 = await pool.query(`
            (SELECT type_of_form, id_private_form, created_at_date, created_at_time
            FROM history 
            WHERE           (usr_id = $1) 
                    AND     (created_at_date = $2) 
                    AND     (created_at_time = (SELECT min(created_at_time) 
                                                FROM history 
                                                WHERE usr_id = $1 AND created_at_date = $2)
                            )
            )
            UNION
            (SELECT type_of_form, id_private_form, created_at_date, created_at_time
            FROM history
            WHERE           (usr_id = $1)
                    AND     (created_at_date = $3)
                    AND     (created_at_time = (SELECT max(created_at_time) 
                                                FROM history 
                                                WHERE usr_id = $1 AND created_at_date = $3)
                            )
            )
            ORDER BY created_at_date ASC, created_at_time ASC
            `, [usr_id, start_date, current_date]
        );
    
        if(query1.rowCount !== 2) throw new Error(`Return more than 2 rows (${query1.rowCount} rows) in oldest_lastest forms for odometer diff in chiphi`);
    
        const oldest_and_lastest_forms_of_history = query1.rows;
       
        const array_of_oldest_latest_odometer = await Promise.all(oldest_and_lastest_forms_of_history.map((each_form) => extract_odometer_value(each_form)));
        const _2_odometers = array_of_oldest_latest_odometer.map((each_query_value) => parseFloat(each_query_value.rows[0].odometer));
    
        const km_driven = _2_odometers[1] - _2_odometers[0];
        
        //return oldest_and_lastest_forms_of_history;
        //return array_of_oldest_latest_odometer;
        return {_2_odometers, km_driven};
    } catch (err) {
        throw new Error(err);
    }
}

const today = async () => {
    const query1 = await pool.query(`SELECT date_trunc('day', now()) as today`);
    return query1.rows[0].today;
}
module.exports = {
    print_report: async (usr_id) => {

        try {
            const entry_chiphi = await count_row_in_table(usr_id);

            //THERE ARE 3 CASES that either happens
            //The chiphi table has 0 form
            //The chiphi table has 1 form
            //The chiphi table has multiple forms => This is where alot of computation is executed.

            if(entry_chiphi === 0 ) {
                const todayy = await today();
                return {
                    entry: {
                        entry_chiphi,
                        start_date: todayy,
                        current_date: todayy,
                        date_diff: 0
                    },
                    statistics: {
                        total_money: 0,
                        by_day: 0.000,
                        by_km: 0.000,
                    }
                }
            }

            // if(entry_chiphi === 1) {
            //     console.log('CHI PHI ENNTRYYY === 1');
            //     const {start_date, current_date, date_diff} = await get_start_day_and_current_day(usr_id);
            //     const total_money = await total_money_spent(usr_id);
            //     return {
            //         entry: {
            //             entry_chiphi,
            //             start_date,
            //             current_date,
            //             date_diff
            //         },
            //         statistics: {
            //             total_money,
            //             by_day: parseFloat((total_money/date_diff).toFixed(3)),
            //             by_km: 0,
            //         }
            //     }
            // }

            // When there are multiple forms 
            
            const {start_date, current_date, date_diff} = await get_start_day_and_current_day(usr_id);
            //Get number of rows in chiphi table + CHECK

            //Get start_day and current_day in history table + CHECK

            //Count total_cost   & by_day_cost and finally by km_cost (IN PROGRESS)
            //Step 1: count total_cost CHECK
            const total_money = await total_money_spent(usr_id);

            //Step 2: count the DATE DIFF between first day and last day to count BY_DAY (in history table)  CHECK
            const by_day = parseFloat((total_money / date_diff).toFixed(3));

            //Step 3: count the ODOMETER DIFF  between first day and last day to count by_km (in history table)
            const {km_driven} = await total_km_driven(usr_id);

            const by_km = parseFloat((total_money / km_driven).toFixed(3));
            return {
                entry: {
                    entry_chiphi,
                    start_date,
                    current_date,
                    date_diff
                },
                statistics: {
                    total_money: total_money,
                    by_day,
                    by_km,
                }
            }
        } catch (err) {
            throw new Error(err);
        }

    },

}