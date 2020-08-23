const pool = require('./database/pooling');
const { Model } = require('sequelize');
const { parse } = require('path');
const { type } = require('os');

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
        console.table(query_NLL.rows);
        return query_NLL.rows[0].odometer;
    }
    if (type_of_form === 'chiphi') {
        const query_CP = await pool.query(`SELECT odometer from chiphi where id = $1`, [id_private_form]);
        console.table(query_CP.rows);
        return query_CP.rows[0].odometer;
    }
    if (type_of_form === 'dichvu') {
        const query_DV = await pool.query(`SELECT odometer from dichvu where id = $1`, [id_private_form]);
        console.table(query_DV.rows);
        return query_DV.rows[0].odometer;
    }
    if (type_of_form === 'thunhap') {
        const query_TN = await pool.query(`SELECT odometer from thunhap where id = $1`, [id_private_form]);
        console.table(query_TN.rows);
        return query_TN.rows[0].odometer;
    }
}

const find_odometer_without_privateID = async (type_of_form, created_at_date, created_at_time) => {
    if(type_of_form === 'napnhienlieu'){
        const query_NLL = await pool.query(`SELECT odometer from napnhienlieu where date = $1 and time = $2`, [created_at_date, created_at_time]);
        console.table(query_NLL.rows);
        return query_NLL.rows[0].odometer;
    }
    if(type_of_form === 'chiphi'){
        const query_CP = await pool.query(`SELECT odometer from chiphi where date = $1 AND time = $2`, [created_at_date, created_at_time]);
        console.table(query_CP.rows);
        return query_CP.rows[0].odometer;
    }
    if(type_of_form === 'dichvu'){
        const query_DV = await pool.query(`SELECT odometer from dichvu where date = $1 AND time = $2`, [created_at_date, created_at_time]);
        console.table(query_DV.rows);
        return query_DV.rows[0].odometer;
    }
    if(type_of_form === 'thunhap'){
        const query_TN = await pool.query(`SELECT odometer from thunhap where date = $1 AND time = $2`, [created_at_date, created_at_time]);
        console.table(query_TN.rows);
        return query_TN.rows[0].odometer;
    }
}

//============================================ Handle 1: CHECK IN THE SAME DAY COMPARED TO THE INPUT DATE ========================================
const max_Odometer_of_the_smaller_side_SAME_DATE = async (usr_id, date, time) => {
    try {
        //Find out the max time in the small half rows;

        //ExpectedOutput = {id_private_form, type_of_form_, created_at_date, created_at_time}
        //Max odometer of the lower half of the timeline
        const find_max_history = await pool.query(`
        SELECT id_private_form, type_of_form, created_at_date, created_at_time
        FROM history
        WHERE (usr_id = $1) AND (created_at_date = $2) AND (created_at_time < $3) AND (type_of_form <> $4)
        ORDER BY created_at_time desc, id_private_form, type_of_form, created_at_date
        LIMIT 1`, [usr_id, date, time, 'quangduong']);
        let max_odometer;

        //Emtry rows
        if (find_max_history.rowCount === 0) {
            console.log('=== Check nested max_odo_same_day ===')
            max_odometer = max_Odometer_of_the_smaller_side_DIFF_DATE(usr_id, date);
            return max_odometer;
            // return max_odometer;
        }
        const result_of_query = find_max_history.rows[0];
        const {type_of_form, id_private_form} = result_of_query;

        console.log('==========================================================================')
        console.log('MAX of the lower half - Server | Min - with client perspective | SAME DATE');
        console.table(find_max_history.rows);
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

const min_Odometer_of_the_bigger_side_SAME_DATE = async (usr_id, date, time, odometer) => {
    try {
        const find_min_history = await pool.query(`
        SELECT id_private_form, type_of_form, created_at_date, created_at_time
        FROM history
        WHERE usr_id = $1 AND created_at_date = $2 AND created_at_time > $3 AND (type_of_form <> $4)
        ORDER BY created_at_time asc, id_private_form, type_of_form, created_at_date
        LIMIT 1
        `,[usr_id, date, time, 'quangduong']);
        
        console.log(`========================= INPUT ODOMETER: ${odometer}`);
        console.log('MIN of the upper half - Server | Max - with client perspective | SAME DATE');
        console.table(find_min_history.rows);

        //Check if the query returns 0 row => There is no form existing passed this condition
        let min_odometer;
        if(find_min_history.rowCount === 0) {
            min_odometer = min_Odometer_of_the_bigger_side_DIFF_DATE(usr_id, date, odometer);
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

//============================================ Handle 2: CHECK IN OTHER DAYs COMPARED TO THE INPUT DATE ============================================
//===============================USED WHEN THERE IS NO FORM EXISTING IN THE DATABASE WITH THAT INPUT DATE ===============================

const max_Odometer_of_the_smaller_side_DIFF_DATE = async (usr_id, date) => {

    try {
        //Find out the latest form before the input form => Finding the max odometer of all the form inputed before this form => treat it as the min to check the newly imported date
        const query1 = await pool.query(`
        SELECT created_at_date, type_of_form, max(created_at_time) as created_at_time_max
        FROM history
        WHERE (usr_id = $1) AND (created_at_date < $2) AND (type_of_form <> $3)
        GROUP BY created_at_date, type_of_form
        ORDER BY created_at_date desc, created_at_time_max desc
        LIMIT 1
        `,[usr_id, date, 'quangduong']);
        
        console.log('==========================================================================')
        console.log('MAX of the lower half - Server | Min - with client perspective | DATE DIFF');
        console.table(query1.rows);
        let max_odometer;
        if (query1.rowCount === 0) {
            max_odometer = 0;
            return max_odometer;
        }

        //Extract in the query only row => the above query returns only 1 object
        const {type_of_form, created_at_date, created_at_time_max} = query1.rows[0];
        const find_odometer = await find_odometer_without_privateID(type_of_form, created_at_date, created_at_time_max);
 
        max_odometer = find_odometer;
        //parse String odometer to Float odometer
        const max_odometerF = parseFloat(max_odometer);
        return max_odometerF;
    } catch (err) {
        throw new Error(err);
    }
}

const min_Odometer_of_the_bigger_side_DIFF_DATE = async (usr_id, date, odometer) => {
    try {
        //We dont check quang duong condition | As Quangduong helps user to store there trip only | We dont do computation on this field => Filtration required
        const query1 = await pool.query(`
        SELECT created_at_date, type_of_form, min(created_at_time) as created_at_time_min
        FROM history
        WHERE (usr_id = $1) AND (created_at_date > $2) AND (type_of_form <> $3)
        GROUP BY created_at_date, type_of_form
        ORDER BY created_at_date asc, created_at_time_min asc
        LIMIT 1
        `, [usr_id, date, 'quangduong']);
        
        console.log(`========================= INPUT ODOMETER: ${odometer}`);
        console.log('MIN of the upper half - Server | Max - with client perspective | DATE DIFF');
        console.table(query1.rows);

        let min_odometer;
        //Row count === 0 meaning that there are no form after the input date
        if(query1.rowCount === 0) {
            min_odometer = 0;
            return min_odometer;
        }
        //Extract info from the query row
        const {type_of_form, created_at_date, created_at_time_min} = query1.rows[0];
        
        //Find the odometer
        const find_odometer = await find_odometer_without_privateID(type_of_form, created_at_date, created_at_time_min);
        
        //find_odometer = {value: 'valueOf_odometer, all: 'return the whole array to check if there are more than one retured'}
        min_odometer = find_odometer;

        //convert string odometer into FLOAT odometer
        const min_odometerF = parseFloat(min_odometer);
        return min_odometerF;
    } catch (err) {
        throw new Error(err);
    }
}


//============================== isQualified IS THE CONTROLLER OF ALL THE POSSIBILITIES OF THE INPUT ===================================
const isQualified = async (odometer, usr_id, date, time) => {
   
    const isEmpty = await isTheDayEmpty(usr_id, date);
    //If on that day, there are no form exsiting | We must check the form of other days, in order to find the min and max odometer to check the odometer input
    if(isEmpty === true) {
        console.log(`ODOMETER INPUT : ${odometer}`);
        //2 gia tri odometer da duoc parse thanh Float
        const max_odometer_date_diff = await max_Odometer_of_the_smaller_side_DIFF_DATE(usr_id, date); //Min to the client side
        const min_odometer_date_diff = await min_Odometer_of_the_bigger_side_DIFF_DATE(usr_id, date, odometer); //Max to the client side
        if (max_odometer_date_diff === 0 && min_odometer_date_diff === 0) {
            return {message: 'This is the first time a form is created', status: true};
        } 
        if(max_odometer_date_diff === 0 && min_odometer_date_diff !== 0) {
            return (odometer < min_odometer_date_diff) 
            ? {message: 'If min = 0 thi odometer only needs to be smaller than max',min: max_odometer_date_diff, odometer, max: min_odometer_date_diff, status: true}  
            : {message: 'If min = 0 thi odometer only needs to be smaller than max',min: max_odometer_date_diff, odometer, max: min_odometer_date_diff, status: false}
        }
        if(max_odometer_date_diff !== 0 && min_odometer_date_diff === 0) {
            return (odometer > max_odometer_date_diff) 
            ? {message: 'If max = 0 thi odometer only needs to be bigger than min', min: max_odometer_date_diff, odometer, max: min_odometer_date_diff, status: true}
            : {message: 'If max = 0 thi odometer only needs to be bigger than min', min: max_odometer_date_diff, odometer, max: min_odometer_date_diff, status: false}
        }
        if(max_odometer_date_diff !== 0 && min_odometer_date_diff !== 0) {
            return (min_odometer_date_diff < odometer && odometer < min_odometer_date_diff) 
            ? {message: 'must be in between min & max', min: max_odometer_date_diff, odometer, max: min_odometer_date_diff, status: true}
            : {message: 'must be in between min & max', min: max_odometer_date_diff, odometer, max: min_odometer_date_diff, status: false}
        }

    }

    const isIdenticalExist_bool = await isIdenticalExist(usr_id, date, time);
    if (isIdenticalExist_bool === true) {
        console.log('Đã tồn tại form với thời gian trên');
        return {
            err: 'The form with that exact date time has existed',
            date: date,
            time: time,
            status: false
        };
    }
    
    //handle 1: is used here // Handle 1 nests Handle 2 => Handle 2 is called when no form in either lower half or upper half has no data => continue to find on other dates
    const max_odometer_same_date = await max_Odometer_of_the_smaller_side_SAME_DATE(usr_id, date, time); //Min to the client side
    const min_odometer_same_date = await min_Odometer_of_the_bigger_side_SAME_DATE(usr_id, date, time, odometer); //Max to the client side

    console.log(`ODOMETER INPUT : ${odometer}`);
    //Min value sent to the return meaning: At least, the input value must be bigger than min and smaller than max obviously
    if(max_odometer_same_date === 0 && min_odometer_same_date !== 0) {
        return (odometer < min_odometer_same_date)  //the message helps client side developers to understand | Not the server coders | if you are a server coder, ignore the message and read the code
        ? {message: 'If min = 0 thi odometer only needs to be smaller than max',min: max_odometer_same_date, odometer, max: min_odometer_same_date, status: true} 
        : {message: 'If min = 0 thi odometer only needs to be smaller than max',min: max_odometer_same_date, odometer, max: min_odometer_same_date, status: false};
    }
    if(max_odometer_same_date !== 0 && min_odometer_same_date === 0) {
        return (odometer > max_odometer_same_date) 
        ? {message: 'If max = 0 thi odometer only needs to be bigger than min', min: max_odometer_same_date, odometer, max: min_odometer_same_date, status: true} 
        : {message: 'If max = 0 thi odometer only needs to be bigger than min', min: max_odometer_same_date, odometer, max: min_odometer_same_date, status: false};
    }
    if(max_odometer_same_date !== 0 && min_odometer_same_date !== 0) {
        return (max_odometer_same_date < odometer && odometer < min_odometer_same_date) 
        ? {message: 'must be in between min & max', min: max_odometer_same_date, odometer, max: min_odometer_same_date, status: true} 
        : {message: 'must be in between min & max', min: max_odometer_same_date, odometer, max: min_odometer_same_date, status: false};
    }
}

module.exports = {
    isQualified,
}