const pool = require('./pooling');

module.exports = {
    print_1_nhacnho: async (usr_id) => {
        const query1 = await pool.query(`
        SELECT one_time_reminder as type, otr_date as date
        FROM nhacnho
        WHERE usr_id = $1 AND one_time_reminder = $2
        ORDER BY otr_date desc
        LIMIT 1
        `,[usr_id, true]);
        return query1.rows[0];
    },

    insert: async (nhacnho_id, usr_id, inputFromUser) => {
        const {name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, RR_km, RR_period, note} 
        = inputFromUser;

        // Convert OTR & RR to bool from string
        const one_time_reminderB = (one_time_reminder === 'true') ? true : false;
        const repeat_reminderB = (repeat_reminder === 'true') ? true: false;

        if(one_time_reminderB && repeat_reminderB) {
            console.log('One_time_reminder & repeat_reminder are all set to true');
            throw new Error('One_time_reminder & repeat_reminder are all set to true');
        }
        if(!one_time_reminderB && !repeat_reminderB) {
            console.log('One_time_reminder & repeat_reminder are all set to false');
            throw new Error('One_time_reminder & repeat_reminder are all set to false');
        }

        if(one_time_reminderB === true) {
            const OTR_kmI = parseInt(OTR_km);
            try {
                await pool.query(`insert into nhacnho (id, usr_id, name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, note)
                values ($1, $2, $3, $4, $5, $6, $7, $8)`
                ,[nhacnho_id, usr_id, name_of_reminder, one_time_reminderB, repeat_reminderB, OTR_kmI, OTR_date, note]);
            } catch (err) {
                throw new Error({message: 'failed at nhacnho method where OTR === true', err});
            }
        }
        
        if(repeat_reminderB === true) {
            const RR_kmI = parseInt(RR_km);
            try {
                await pool.query(`insert into nhacnho (id, usr_id, name_of_reminder, one_time_reminder, repeat_reminder, RR_km, RR_period, note)
                values ($1, $2, $3, $4, $5, $6, $7, $8)`
                ,[nhacnho_id, usr_id, name_of_reminder, one_time_reminderB, repeat_reminderB, RR_kmI, RR_period, note]);

            } catch (err) {
                throw new Error({message: 'failed at nhac nhac method where RR === true', err});
            }
        }
    },

    print: async (usr_id) => {
        try {
            const query1 = await pool.query(`SELECT * FROM nhacnho WHERE usr_id = $1`,[usr_id]);
            return query1.rows;
        } catch (err) {
            throw new Error({message: 'failed at nhacnho print method', err});
        }
    },  

    update: async (u_id, inputFromUser) => {
        const {form_id, name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, RR_km, RR_period, note}
        = inputFromUser;

        if (one_time_reminder === repeat_reminder) return res.status(403).send({message: 'one_time_reminder & repeat_reminder can not be all true of all false'});
        const one_time_reminderB = (one_time_reminder === 'true') ? true : false;
        const repeat_reminderB = (repeat_reminder === 'true') ? true : false;

        try {
            if(one_time_reminderB === true) {
                const OTR_kmI = parseInt(OTR_km);
                await pool.query(`update nhacnho
                                  set name_of_reminder = $1, one_time_reminder = $2 , repeat_reminder = $3, OTR_km = $4, OTR_date = $5, note = $6
                                  where id = $7 AND usr_id = $8`, 
                [name_of_reminder, true, false, OTR_kmI, OTR_date, note, form_id, u_id]);
    
            } // if one_time_reminder === false  => repeat_reminder === true
            else {
                const RR_kmI = parseInt(RR_km);
                await pool.query(`update nhacnho
                                  set name_of_reminder = $1, one_time_reminder = $2, repeat_reminder = $3, RR_km = $4, RR_period = $5, note = $6
                                  where id = $7 AND usr_id = $8`,
                [name_of_reminder, false, true, RR_kmI, RR_period, note, form_id, u_id]);
            }
        }
        catch (err) {
            throw new Error('failed at nhac nho method update');
        }
    },
    delete: async (usr_id, form_id) => {
        try {
            await pool.query(`DELETE FROM nhacnho WHERE usr_id = $1 AND id = $2 `, [usr_id, form_id]);
            await pool.query(`DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2 `, [usr_id, form_id]);
        } catch (err) {
            throw new Err({message: 'failed at nhac nho delete', ERR: err});
        }
    }
};