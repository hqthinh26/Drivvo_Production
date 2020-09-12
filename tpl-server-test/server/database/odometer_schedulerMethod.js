const app_firebase = require('./firebase');
const schedule = require('node-schedule');
const deviceMethod = require('./deviceMethod');
const pool = require('./pooling');
const e = require('express');
const nhacnhoMethod = require('./nhacnhoMethod');

const push_notification_if_needed = async (usr_id, odometer) => {
    try {
        //odometer parser
        const odometerF = parseFloat(odometer);

        const query1 = await pool.query(`
        SELECT id, name_of_nhacnho, ot_at_odometer
        FROM nhacnho
        WHERE (usr_id = $1) AND (is_one_time = $2) AND (OT_at_odometer < $3) AND (OT_at_odometer <> 0.0)
        `, [usr_id, true, odometerF]);
        console.log('=======================Danh sách nhắc nhở có odometer nhỏ hơn odometer input=================');
        console.table(query1.rows);
        console.log('======================= END TABLE OF CONTENT FIREBASE NHAC NHO ROW=================');
        if(query1.rowCount === 0) {
            return console.log('Không có nhắc nhở của OT_at_odometer nào được push');
        }

        const pushable_nhacnho_table = query1.rows; //[{id, name_of_nhacnho, ot_at_odometer}, {}, {}, ...]
        let padding_time = 5 * 1000;

        pushable_nhacnho_table.forEach(
            (each_pushable, index) => {
                
                //BINDED OBJECT
                const binded_object = {
                    nhacnho_id: each_pushable.id,
                    name_of_nhacnho: each_pushable.name_of_nhacnho,
                    ot_at_odometer: each_pushable.ot_at_odometer,
                    usr_id: usr_id,
                };
                //FORMING THE SCHEDULE
                schedule.scheduleJob(new Date(Date.now() + padding_time), async function(binded_object) {
                    const query1 = await pool.query(`SELECT device_unique_id FROM deviceid WHERE usr_id = $1`, [binded_object.usr_id]);
                    const array_tokens = query1.rows.map(each_row => each_row.device_unique_id);
                    if (array_tokens.length === 0) {
                        return console.log('Không có thiết bị nào cả');
                    }
                    const payload = {
                        tokens: array_tokens,
                        notification: {
                            title: `Nhắc nhở theo odometer`,
                            body: `odometer tới hạn: ${binded_object.ot_at_odometer} | message: ${binded_object.name_of_nhacnho}`,
                        }
                    };

                    const result = await app_firebase.messaging().sendMulticast(payload);
                    console.log('Send Notification thanh cong');
                }.bind(null, binded_object));
                //ADDING PADDING TIME là 1 phút đối với mỗi notification tiếp theo
                padding_time = padding_time + 60 * 1000;
                console.log({Push_notification: `${index + 1}`, expiredOdometer: each_pushable.ot_at_odometer});
            }
        );   
        console.log(`Đã Schedule Push ${pushable_nhacnho_table.length} nhắc nhở`)     
        // const table_of_name = query1.rows; // [{id, name_of_nhacnho}];

        // let push_after_10_senconds = 10 * 1000;

        // const table_of_device_tokens = await deviceMethod.user_tokens(usr_id);

        // table_of_name.forEach(
        //     (each_nhacnho, index) => {
        //         const payload = {
        //             tokens: table_of_device_tokens,
        //             notification: {
        //                 title: 'Nhắc nhở từ Money Geek',
        //                 body: `Thông điệp: ${each_nhacnho.name_of_nhacnho}`,
        //             }
        //         };
        //         schedule.scheduleJob(new Date(Date.now() + push_after_10_senconds), async function() {
        //             const result = await app_firebase.messaging().sendMulticast(payload);
        //             console.log(`Thanh cong: ${result}`);
        //             await nhacnhoMethod.deletex(usr_id, each_nhacnho.id);

        //         }.bind(null, payload));
        //         console.log(`ForEach lần ${index + 1}`);
        //         push_after_10_senconds = push_after_10_senconds + 10 * 1000;
        //     }
        // );
        // return console.log(`Push ${table_of_name.length} notifications to user`);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    push_notification_if_needed,
}