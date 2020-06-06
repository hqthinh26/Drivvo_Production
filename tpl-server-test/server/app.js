
require('dotenv').config();

const express = require('express');

const morgan = require('morgan');

const createError = require('http-errors');
const jwt = require('jsonwebtoken');
require('express-async-errors');
const bodyParser = require('body-parser');
const PORT = 3000;
const app = express();
const pool = require('./database/pooling');
const bcryptjs = require('bcryptjs');

//From database folder 
const tokenMethod = require('./database/tokenMethod');

//From auth folder
const Auth_IN_OUT = require('./auth/Auth_IN_OUT');

//From basicMethod folder
const Regis_In_Out = require('./basicMethod/Regis_In_Out');

app.use(morgan('dev'));
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Router
app.use('/napnhienlieu',require('./routers/napnhienlieuRoute'));
app.use('/chiphi',require('./routers/chiphiRoute'));
app.use('/thunhap',require('./routers/thunhapRoute'));
app.use('/dichvu',require('./routers/dichvuRoute'));
app.use('/users',require('./routers/usersRoute'));
app.use('/history', require('./routers/historyRoute'));


// @ts-ignore
app.get('/', (req,res) => {
  res.send('This is drivvo project');
})

//Check if this users has existed in the system or not? before the registration process
//related folders: BasicMethod - User Method
app.post('/register', Regis_In_Out.register);
8
// Check if the user has exsited in the system or not? if it has, then send them to token
//Related Folder: BasicMethod - User Method (check valid user)- Token Method (insert token)
app.post('/login', Regis_In_Out.login);

//Check if the token sent by the customer exists in the system before allowing them to logout
//Related Files/Folder: BasicMethod - Token Method - Auth_In_Out
app.post('/logout', Auth_IN_OUT.extractToken, Regis_In_Out.logout);


app.listen(PORT, () => {
  console.log(`API is running at http://localhost:${PORT}`);
})


app.get('/unhash', (req,res) => {
  const {hashedString,pw} = req.body;
  console.log({hash: hashedString, pw});
  try {
    bcryptjs.compare(pw,hashedString) ? console.log('successful') : console.log('failed')
    return res.sendStatus(200);
  } catch (err) {
    console.log({mess: err});
    return res.sendStatus(403);
  }

})