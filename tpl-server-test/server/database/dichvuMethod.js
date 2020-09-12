const pool = require('./pooling');

module.exports = {
    print: async (usr_id) => {
        try {
            const query = await pool.query(`
            SELECT dv.id, dv.odometer, ldv.name as type_of_service, dv.amount, dd.name as place, dv.note ,dv.date, dv.time
            FROM dichvu as dv
            INNER JOIN loaidichvu as ldv
                ON  dv.type_of_service = ldv.id
            INNER JOIN diadiem as dd
                ON dv.place = dd.id
            WHERE dv.u_id = $1
            ORDER BY dv.date desc, dv.time desc
            `, [usr_id]);
            const dichvu_arr = query.rows;
            return dichvu_arr;
        } catch (err) {
            throw new Error(err);
        }
    },

    insert: async (dichvu_id, usr_id, inputFromClient) => {
        const {odometer, type_of_service, amount, place, note, date, time} = inputFromClient;
        const odometerF = parseFloat(odometer);
        const amountI = parseInt(amount);

        //type_of_service and place are now INT8-typed VALUES
        //converting from STRING to BIGINT

        const type_of_serviceBI = BigInt(type_of_service);
        const placeBI = BigInt(place);
        try {
            await pool.query(`insert into dichvu (id, u_id, date, time, odometer, type_of_service, amount, place, note)
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
            , [dichvu_id, usr_id, date, time, odometerF, type_of_serviceBI, amountI, placeBI, note]);
        } catch (err) {
            throw new Error(err);
        }
        
    },

    _update: async (form_id, inputFromUser) => {
        const {odometer, type_of_service, amount, location, note, time, date} = inputFromUser;
        const odometerF = parseFloat(odometer);
        const amountI = parseInt(amount);

        try {
            await pool.query(`update dichvu
            set odometer = $1, type_of_service = $2, amount = $3, location = $4, note = $5, time = $6, date = $7
            where id = $8`, [odometerF, type_of_service, amountI, location, note, time, date, form_id]);

        } catch (err) {
            throw new Error(err);
        }
    },
    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM dichvu WHERE u_id = $1 AND id = $2 `, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2`, [usr_id, form_id]);
        } catch (err) {
            throw new Err(err);
        }
    }
}

