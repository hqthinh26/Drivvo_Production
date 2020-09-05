const pool = require("./pooling");
const moment = require('moment');
const { STRING } = require("sequelize");
//FIREBASE RELATED
const deviceMethod = require('./deviceMethod');
const schedule = require('node-schedule');
const app_firebase = require('./firebase');

const check_valid = (type_of_expense, type_of_service) => {
  let type_of_expenseB;
  let type_of_serviceB;
  if(typeof type_of_expense === "boolean") {
    type_of_expenseB = type_of_expense;
    console.log({message: 'isValid: expense is boolean', value: type_of_expense});
  }
  if(typeof type_of_expense === "string") {
    type_of_expense === 'true' ? type_of_expenseB = true : type_of_expenseB = false;
    console.log({message: 'isValid: expense is string', value: type_of_expense});
  }

  if(typeof type_of_service === "boolean") {
    type_of_serviceB = type_of_service;
    console.log({message: 'isValid: service is boolean', value: type_of_service});
  }
  if(typeof type_of_service === "string") {
    type_of_service === 'true' ? type_of_serviceB = true : type_of_serviceB = false; 
    console.log({message: 'isValid: service is string', value: type_of_service});
  }
  
  return (type_of_expenseB === type_of_serviceB) ? false : true;
}

const insert = async (nhacnho_id, usr_id, input_From_User) => {
  try {
    const {type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometer, OT_at_date, RR_at_km_range, RR_period, note} 
    = input_From_User;

    if(check_valid(type_of_expense, type_of_service) === false) throw new Error('bool expense must # bool service');

    const OT_at_odometerF = parseFloat(OT_at_odometer);
    const RR_at_km_rangeI = parseInt(RR_at_km_range);

    await pool.query(`
    INSERT INTO nhacnho(id, usr_id, type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometer, OT_at_date, RR_at_km_range, RR_period, note)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `,[nhacnho_id, usr_id, type_of_expense, type_of_service, name_of_nhacnho, is_one_time, OT_at_odometerF, OT_at_date, RR_at_km_rangeI, RR_period, note]);
    

    //Below is FIREBASE CLOUD MESSAGING

    const binded_object = {
      nhacnho_id,
      name_of_nhacnho,
    };

    console.log({ISSS_ONEEE_TIME: is_one_time}); //Show if is_one_time value is sent as STRING or BOOLEAN

    if (is_one_time === true || is_one_time === 'true') {
      console.log('INSIDE IS ONE');
      const device_tokens = await deviceMethod.user_tokens(usr_id);
      const one_token = device_tokens[0];
      const date_10s_ahead = new Date(Date.now() + 10 * 1000);
      
      const scheduled_job = schedule.scheduleJob(date_10s_ahead, async function() {
        const payload = {
          token: one_token,
          notification: {
            title: 'I hope this work well background',
            body: `${binded_object.name_of_nhacnho}`,
          },
        };
        const result = await app_firebase.messaging().send(payload);
        console.log(`Sucessfully sent: ${result}`);
      }.bind(null, binded_object));
    //END FIREBASE CLOUD MESSAGING
    }
  } catch (err) {
    throw new Error(err);
  }
};

const print = async (usr_id) => {
  try {
    const query1 = await pool.query(`
    SELECT * FROM nhacnho WHERE usr_id = $1
    `, [usr_id]);
    return query1.rows;
  } catch (err) {
    throw new Error(err);
  }
};

const print_today_list = async (usr_id) => {
  try {
    const date = new Date(); //On heroku - time is taken bases on American Hour
    //convert american time on heroku to VN time
    const US_hour = date.getHours();
    const VN_hour = US_hour + 7; //as vietnam is 7 hours after the US
    date.setHours(VN_hour);
    //
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const today = `${year}-${month}-${day}`;
    console.log({today});
    const query1 = await pool.query(`
    SELECT name_of_nhacnho, is_one_time, ot_at_odometer, ot_at_date FROM nhacnho
    WHERE (usr_id = $1) AND (is_one_time = $2) and (ot_at_date = $3)
    `, [usr_id, true, today]);
    return query1.rows;
  } catch (err) {
    throw new Error(err);
  }
};

const deletex = async (usr_id, form_id) => {
  try {
    await pool.query(`DELETE FROM nhacnho WHERE usr_id = $1 and id = $2`, [usr_id, form_id]);
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  insert,
  print,
  print_today_list,
  deletex,
}

/*module.exports = {
  insert: async (nhacnho_id, usr_id, inputFromUser) => {
    try {
        const {
            name_of_reminder,
            one_time_reminder,
            repeat_reminder,
            OTR_km,
            OTR_date,
            RR_km,
            RR_period,
            note,
        } = inputFromUser;

        // Convert OTR & RR to bool from string
        const one_time_reminderB = one_time_reminder === "true" ? true : false;
        const repeat_reminderB = repeat_reminder === "true" ? true : false;
        if (one_time_reminderB && repeat_reminderB) {
            console.log("One_time_reminder & repeat_reminder are all set to true");
            throw new Error(
            "One_time_reminder & repeat_reminder are all set to true"
            );
        }
        if (!one_time_reminderB && !repeat_reminderB) {
            console.log("One_time_reminder & repeat_reminder are all set to false");
            throw new Error(
            "One_time_reminder & repeat_reminder are all set to false"
            );
        }

        if (one_time_reminderB === true) {
            let OTR_kmI;
            if (OTR_km === "") {
            console.log("OTR_KM === emtry string");
            OTR_kmI = 0;
            } else {
            OTR_kmI = parseInt(OTR_km);
            }
            await pool.query(
            `insert into nhacnho (id, usr_id, name_of_reminder, one_time_reminder, repeat_reminder, OTR_km, OTR_date, note)
                    values ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                nhacnho_id,
                usr_id,
                name_of_reminder,
                one_time_reminderB,
                repeat_reminderB,
                OTR_kmI,
                OTR_date,
                note,
            ]
            );
        }

        if (repeat_reminderB === true) {
            let RR_kmI;
            if (RR_km === "") {
            console.log("RR_KM === empty string");
            RR_kmI = 0;
            } else {
            RR_kmI = parseInt(RR_km);
            }
            await pool.query(
            `insert into nhacnho (id, usr_id, name_of_reminder, one_time_reminder, repeat_reminder, RR_km, RR_period, note)
                    values ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                nhacnho_id,
                usr_id,
                name_of_reminder,
                one_time_reminderB,
                repeat_reminderB,
                RR_kmI,
                RR_period,
                note,
            ]
            );
        }
    } catch (err) {
      throw new Error(err);
    }
  },

  print: async (usr_id) => {
    try {
      const query1 = await pool.query(
        `SELECT * FROM nhacnho WHERE usr_id = $1`,
        [usr_id]
      );
      return query1.rows;
    } catch (err) {
      throw new Error({ message: "failed at nhacnho print method", err });
    }
  },

  update: async (u_id, inputFromUser) => {
    const {
      form_id,
      name_of_reminder,
      one_time_reminder,
      repeat_reminder,
      OTR_km,
      OTR_date,
      RR_km,
      RR_period,
      note,
    } = inputFromUser;

    if (one_time_reminder === repeat_reminder)
      return res
        .status(403)
        .send({
          message:
            "one_time_reminder & repeat_reminder can not be all true of all false",
        });
    const one_time_reminderB = one_time_reminder === "true" ? true : false;
    const repeat_reminderB = repeat_reminder === "true" ? true : false;

    try {
      if (one_time_reminderB === true) {
        const OTR_kmI = parseInt(OTR_km);
        await pool.query(
          `update nhacnho
                                  set name_of_reminder = $1, one_time_reminder = $2 , repeat_reminder = $3, OTR_km = $4, OTR_date = $5, note = $6
                                  where id = $7 AND usr_id = $8`,
          [
            name_of_reminder,
            true,
            false,
            OTR_kmI,
            OTR_date,
            note,
            form_id,
            u_id,
          ]
        );
      } // if one_time_reminder === false  => repeat_reminder === true
      else {
        const RR_kmI = parseInt(RR_km);
        await pool.query(
          `update nhacnho
                                  set name_of_reminder = $1, one_time_reminder = $2, repeat_reminder = $3, RR_km = $4, RR_period = $5, note = $6
                                  where id = $7 AND usr_id = $8`,
          [
            name_of_reminder,
            false,
            true,
            RR_kmI,
            RR_period,
            note,
            form_id,
            u_id,
          ]
        );
      }
    } catch (err) {
      throw new Error("failed at nhac nho method update");
    }
  },
  delete: async (usr_id, form_id) => {
    try {
      await pool.query(`DELETE FROM nhacnho WHERE usr_id = $1 AND id = $2 `, [
        usr_id,
        form_id,
      ]);
      await pool.query(
        `DELETE FROM history WHERE usr_id = $1 AND id_private_form = $2 `,
        [usr_id, form_id]
      );
    } catch (err) {
      throw new Err(err);
    }
  },
};*/
