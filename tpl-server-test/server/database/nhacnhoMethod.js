const pool = require('./pooling');

module.exports = {
    insert: async (nhacnho_id, usr_id, inputFromUser) => {
        const {name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, RR_km, RR_period, note} 
        = inputFromUser;

        // Convert OTR & RR to bool from string
        const one_time_reminderB = (one_time_reminder === 'true')? true : false;
        const repeat_reminderB = (repeat_reminder === 'true')? true: false;

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

    }
};