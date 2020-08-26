const pool = require('./database/pooling');
const e = require('express');

const return_odometer = async (type_of_form, id_private_form) => {
    try {
        if(type_of_form === 'napnhienlieu') {
            const queryNLL = await pool.query(`SELECT odometer from napnhienlieu where id = $1`, [id_private_form]);
            return queryNLL.rows[0].odometer;
        }
        if(type_of_form === 'chiphi') {
            const queryCP = await pool.query(`SELECT odometer FROM chiphi WHERE id = $1`, [id_private_form]);
            return queryCP.rows[0].odometer;
        }
        if(type_of_form === 'thunhap') {
            const queryTN =  await pool.query(`SELECT odometer FROM thunhap WHERE id = $1`, [id_private_form]);
            return queryTN.rows[0].odometer;
        } 
        if(type_of_form === 'dichvu') {
            const queryDV = await pool.query(`SELECT odometer FROM dichvu WHERE id = $1`, [id_private_form]);
            return queryDV.rows[0].odometer;
        }
    } catch (err) {
        throw new Error(err);
    }
}
const maxOdometer = async (usr_id) => {
    try {
        const query1 = await pool.query(`
        SELECT created_at_date, type_of_form, max(created_at_time) as created_at_time_max
        FROM history
        WHERE usr_id = $1 and type_of_form <> $2
        GROUP BY created_at_date, type_of_form
        ORDER BY created_at_date desc, created_at_time_max desc
        LIMIT 1`,[usr_id, 'quangduong']);
        if(query1.rowCount === 0) {
            console.log('empty');
            return 0;
        }
        const {created_at_date, created_at_time_max} = query1.rows[0];
        console.log(`===================1=================`);
        console.log({created_at_date, created_at_time_max});
        console.log(`=====================================`);
        
        const query2 = await pool.query(`
        SELECT type_of_form, id_private_form
        FROM history
        WHERE (usr_id = $1) and (created_at_date = $2) and (created_at_time = $3)`
        , [usr_id, created_at_date, created_at_time_max]);

        const {type_of_form, id_private_form} = query2.rows[0];

        console.log(`===================2=================`);
        console.log({type_of_form, id_private_form});
        console.log(query2.rows);
        console.log(`===================2=================`);

        const odometer = await return_odometer(type_of_form, id_private_form);

        console.log(`===================3=================`);
        console.log({Value_of_odometer: odometer, typeofOdomter: typeof odometer});
        console.log(`===================3=================`);

        return parseFloat(odometer);
        
    } catch (err) {
        throw Error(err);
    }
}


module.exports = {
    maxOdometer,
}