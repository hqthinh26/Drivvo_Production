require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const {uuid} = require('uuidv4');
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

app.post('/dich_vu_diadiem_null', Auth_IN_OUT.extractToken, async (req, res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const new_form_id = uuid();

    const {odometer, type_of_service, amount, place, note, date, time} = req.body;

    const odometerF = parseFloat(odometer);
    const type_of_serviceB = BigInt(type_of_service); // !== NULL
    const amountI = parseInt(amount);
    const placeB = place === null ? null : BigInt(place);

    console.log({PLACE: place, PLACEB: placeB});

    const query1 = await pool.query(`
    INSERT INTO dichvu(id, u_id, odometer, type_of_service, amount, place, note, date, time)
    VALUES ($1, $2, $3, $4,$5, $6, $7, $8, $9)
    `, [new_form_id, usr_id, odometerF, type_of_serviceB, amountI, placeB, note, date, time]);

    res.status(200).send({message: `Them thanh vao dich vu voi Place: ${place}`});

  } catch (err) {
    res.status(400).send({err});
  }
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

app.get('/is_valid_token', async (req, res) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(403).send({message: 'Missing Authorized Token'});
  const token = header.split(' ')[1];

  const result = await pool.query(`SELECT id FROM token WHERE token_value = $1`, [token]);
  const status = result.rowCount === 1 ? true : false;
  if (status === true) {
    res.status(200).send({message: 'hop le'});
  } else {
    res.status(400).send({message: 'Khong hop le'});
  }
})

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