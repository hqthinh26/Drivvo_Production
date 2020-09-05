require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
require('express-async-errors');

//======================================= >< =======================================
const bodyParser = require('body-parser');
const PORTX = 3000;
const app = express();
const bcryptjs = require('bcryptjs');

//From database folder 
const tokenMethod = require('./database/tokenMethod');
const napNLMethod = require('./database/napNLMethod');

//From auth folder
const Auth_IN_OUT = require('./auth/Auth_IN_OUT');
const napNLReport = require('./report/napNLReport');

//From basicMethod folder
const Regis_In_Out = require('./basicMethod/Regis_In_Out');
const pool = require('./database/pooling');
const nhacnhoMethod = require('./database/nhacnhoMethod');

const input_qualifier = require('./input_qualifier');
const findMaxOdometer = require('./findMaxOdometer');

const app_firebase = require('./database/firebase');
const schedule = require('node-schedule');

app.use(morgan('dev'));
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Router
app.use('/device', require('./routers/deviceRoute'));
app.use('/napnhienlieu',require('./routers/napnhienlieuRoute'));
app.use('/chiphi',require('./routers/chiphiRoute'));
app.use('/thunhap',require('./routers/thunhapRoute'));
app.use('/dichvu',require('./routers/dichvuRoute'));
app.use('/users',require('./routers/usersRoute'));
app.use('/history', require('./routers/historyRoute'));
app.use('/quangduong', require('./routers/quangduongRoute'));
app.use('/nhacnho', require('./routers/nhacnhoRoute'));
app.use('/report', require('./routers/reportRoute'));

//Additional Tables | Mini tables
app.use('/loainhienlieu', require('./additional_routers/loainhienlieuRoute'));
app.use('/tramxang', require('./additional_routers/tramxangRoute'));
app.use('/diadiem', require('./additional_routers/diadiemRoute'));
app.use('/loaidichvu', require('./additional_routers/loaidichvuRoute'));
app.use('/loaichiphi', require('./additional_routers/loaichiphiRoute'));
app.use('/loaithunhap', require('./additional_routers/loaithunhapRoute'));
app.use('/lydo', require('./additional_routers/lydoRoute'));

app.get('/', (req,res) => {
  res.send({message: 'Welcome to MONEY GEEK'});
});

app.get('/firebase', (req, res) => {
  const token_1132 = 'dlJxd827RfaJ3rj-PAsv_Q:APA91bFFA23TKUE72kLyDV34MG3MXvKO2Nr3DN6VEyPmdmXI2exvDRhDh26FbamvB2aCzsBfKzJBpM7hA6dC2YJK7VB2wrh3Xyah2MgW8AXBpKBCXExm8dlapv4SXR3yl-tYldn-5A_7';
  const payload = {
    token: token_1132,
    notification: {
        title: '2020 September, 05 2020:19:18',
        body: '12:1811',
    }
}
  const date_5s = new Date(Date.now() + 5 * 1000);
  const job_5s = schedule.scheduleJob(date_5s, function () {
    console.log('Inside 5s');
    app_firebase.messaging().send(payload).then(res => console.log(res)).catch(err => console.log(err));
  })
  console.log('Outside 5s');
  res.status(200).send({message: 'hello firebase'});
});
// //Check if this users has existed in the system or not? before the registration process
// //related folders: BasicMethod - User Method
app.post('/register', Regis_In_Out.register);

app.post('/sign_in_gg', Regis_In_Out.signIN_gg);

// // Check if the user has exsited in the system or not? if it has, then send them to token
// //Related Folder: BasicMethod - User Method (check valid user)- Token Method (insert token)
app.post('/login', Regis_In_Out.login);

// //Check if the token sent by the customer exists in the system before allowing them to logout
// //Related Files/Folder: BasicMethod - Token Method - Auth_In_Out
app.post('/logout', Auth_IN_OUT.extractToken, Regis_In_Out.logout);

app.listen(process.env.PORT, () => {
  console.log(`API is running at http://localhost:${process.env.PORT}`);
});


app.post('/input_qualifier', Auth_IN_OUT.extractToken, async (req,res) => {
  const {odometer, date, time} = req.body;
  try {
    const odometerF = parseFloat(odometer);
    const usr_id = await Auth_IN_OUT._usr_id_from_token(req.token);

    const result = await input_qualifier.isQualified(odometerF, usr_id, date, time);
    //Check by result.status
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})
app.get('/max_odometer', Auth_IN_OUT.extractToken, async (req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const max_odometer = await findMaxOdometer.maxOdometer(usr_id);
    return res.status(200).send({max_odometer}); //{max_odometer: 'value'}
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
})

// // Add time thong qua Date-Time-Picker in forlder 19082020 NODEJSTechnology
// app.post('/add_time', async (req,res) => {
//   const {pickedTime} = req.body;
//   console.log({input: pickedTime, type: typeof pickedTime});
//   try {
//     await pool.query(`INSERT INTO timeonly(time) values ($1)`, [pickedTime]);
//     console.log('SUCCESS');
//     res.status(200).send({input: pickedTime, type: typeof pickedTime});
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });

// //Add time thong qua fetch-node
// app.post('/timezone_free', async (req,res) => {
//   const {time} = req.body;
//   console.log({TIME: time});
//   try {
//     await pool.query(`insert into timezonefree(time) values ($1)`, [time]);
//     res.status(200).send('time zone free added' + time);
//   } catch (err) {
//     console.log({ERR: err});
//   }
// });