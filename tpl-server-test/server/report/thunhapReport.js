const pool = require(`../database/pooling`);

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

const total_km_driven = async (usr_id, start_date, current_date) =>  {
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
    

    
    return query2.rows;
}
    

module.exports = {
    print_report: async (usr_id) => {
        try {
            const entry_number = await find_number_of_entry(usr_id);
            const {start_date, current_date, date_diff} = await oldest_lastest_time_date_history(usr_id);
            const km_driven = await total_km_driven(usr_id, start_date, current_date);
            return {
                entry_number,
                start_date,
                current_date,
                date_diff,
                km_driven
            };
        } catch (err) {
            throw new Error(err);
        }
        
    }
};


