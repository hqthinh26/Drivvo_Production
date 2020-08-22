const pool = require('./database/pooling');
const { Model } = require('sequelize');
const { parse } = require('path');

//Check if there is no form in the database in that input date | TH5
const isTheDayEmpty = async (usr_id, date) => {
    const query1 = await pool.query(`
    SELECT count(id) 
    FROM history 
    WHERE usr_id = $1 AND created_at_date = $2`, [usr_id, date]);
    const count = parseInt(query1.rows[0].count);
    let isEmpty;
    count === 0 ? isEmpty = true : isEmpty = false;
    return isEmpty;
};

const isIdenticalExist = async (usr_id, date, time) => {
    //Check if is there a form in the database that has the exact time and date like the input
    const query1 = await pool.query(`
    SELECT count(id)
    FROM history
    WHERE usr_id = $1 AND created_at_date = $2 AND created_at_time = $3`, [usr_id, date, time]);
    //count value returned from the database in string type => convert to Int
    const count = parseInt(query1.rows[0].count);
    let isIdentical;
    count === 0 ? isIdentical = false : isIdentical = true;
    return isIdentical;
}

const find_odometer = async (type_of_form, id_private_form) => {
    if(type_of_form === 'napnhienlieu') {
        const query_NLL = await pool.query(`SELECT odometer from napnhienlieu where id = $1`, [id_private_form]);
        return query_NLL.rows[0].odometer;
    }
    if (type_of_form === 'chiphi') {
        const query_CP = await pool.query(`SELECT odometer from chiphi where id = $1`, [id_private_form]);
        return query_CP.rows[0].odometer;
    }
    if (type_of_form === 'dichvu') {
        const query_DV = await pool.query(`SELECT odometer from dichvu where id = $1`, [id_private_form]);
        return query_DV.rows[0].odometer;
    }
    if (type_of_form === 'thunhap') {
        const query_TN = await pool.query(`SELECT odometer from thunhap where id = $1`, [id_private_form]);
        return query_TN.rows[0].odometer;
    }
}

const max_Odometer_of_the_smaller_side = async (usr_id, date, time) => {
    try {
        //Find out the max time in the small half rows;

        //ExpectedOutput = {id_private_form, type_of_form_, created_at_date, created_at_time}
        const find_max_history = await pool.query(`
        SELECT id_private_form, type_of_form, created_at_date, created_at_time
        FROM history
        WHERE (usr_id = $1) AND (created_at_date = $2) AND (created_at_time < $3) AND (type_of_form <> $4)
        ORDER BY created_at_time desc, id_private_form, type_of_form, created_at_date
        LIMIT 1`, [usr_id, date, time, 'quangduong']);
        let max_odometer;

        //Emtry rows
        if (find_max_history.rowCount === 0) {
            max_odometer = 0;
            return max_odometer;
        }
        const result_of_query = find_max_history.rows[0];
        const {type_of_form, id_private_form} = result_of_query;

        //output is the value of odometer but in type String
        max_odometer = await find_odometer(type_of_form, id_private_form);

        //convert to type Float
        max_odometerF = parseFloat(max_odometer);

        //return value is type Float
        return max_odometerF;
    } catch (err) {
        throw new Error(err);
    }
}

const min_Odometer_of_the_bigger_side = async (usr_id, date, time) => {
    try {
        const find_min_history = await pool.query(`
        SELECT id_private_form, type_of_form, created_at_date, created_at_time
        FROM history
        WHERE usr_id = $1 AND created_at_date = $2 AND created_at_time > $3 AND (type_of_form <> $4)
        ORDER BY created_at_time asc, id_private_form, type_of_form, created_at_date
        LIMIT 1
        `,[usr_id, date, time, 'quangduong']);
        
        //Check if the query returns 0 row => There is no form existing passed this condition
        let min_odometer;
        if(find_min_history.rowCount === 0) {
            min_odometer = 0;
            return min_odometer;
        }

        const {type_of_form, id_private_form} = find_min_history.rows[0];
        min_odometer = await find_odometer(type_of_form, id_private_form);
        
        //convert min_odometer from type String to type Float
        const min_odometerF = parseFloat(min_odometer);
        return min_odometerF;

    } catch (err) {
        throw new Error(err);
    }
}

const isQualified = async (odometer, usr_id, date, time) => {
    const isEmpty = await isTheDayEmpty(usr_id, date);
    if(isEmpty === true) return {status:true};

    const isIdenticalExist_bool = await isIdenticalExist(usr_id, date, time);
    if (isIdenticalExist_bool === true) {
        console.log('Đã tồn tại form với thời gian trên');
        return {
            err: 'Has existed',
            date: date,
            time: time,
            status: false
        };
    }

    const max_odometer = await max_Odometer_of_the_smaller_side(usr_id, date, time);
    const min_odometer = await min_Odometer_of_the_bigger_side(usr_id, date, time);

    if(max_odometer === 0 && min_odometer !== 0) {
        return (odometer < min_odometer) 
        ? {max: max_odometer, odometer, min: min_odometer, status: true} 
        : {max: max_odometer, odometer, min: min_odometer, status: false};
    }
    if(max_odometer !== 0 && min_odometer === 0) {
        return (odometer > max_odometer) 
        ? {max: max_odometer, odometer, min: min_odometer, status: true} 
        : {max: max_odometer, odometer, min: min_odometer, status: false};
    }
    if(max_odometer !== 0 && min_odometer !== 0) {
        return (max_odometer < odometer && odometer < min_odometer) 
        ? {max: max_odometer, odometer, min: min_odometer, status: true} 
        : {max: max_odometer, odometer, min: min_odometer, status: false};
    }
}
module.exports = {
    isQualified,
}