//@ts-ignore
require('dotenv').config();
// @ts-ignore
const express = require('express');
// @ts-ignore
const morgan = require('morgan');
// @ts-ignore
const createError = require('http-errors');
// @ts-ignore
const jwt = require('jsonwebtoken');
// @ts-ignore
require('express-async-errors');
// @ts-ignore
const bodyParser = require('body-parser');
const PORT = 3000;
const app = express();
// @ts-ignore
const pool = require('./database/pooling');
// @ts-ignore
const bcryptjs = require('bcryptjs');

//From database folder 
// @ts-ignore
const tokenMethod = require('./database/tokenMethod');

//@ts-ignore
//From auth folder
const Auth_IN_OUT = require('./auth/Auth_IN_OUT');

//@ts-ignore
//From basicMethod folder
const Regis_In_Out = require('./basicMethod/Regis_In_Out');

app.use(morgan('dev'));
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//@ts-ignore
//Router
app.use('/napnhienlieu',require('./routers/napnhienlieuRoute'));
// @ts-ignore
app.use('/chiphi',require('./routers/chiphiRoute'));
// @ts-ignore
app.use('/thunhap',require('./routers/thunhapRoute'));
// @ts-ignore
app.use('/dichvu',require('./routers/dichvuRoute'));
// @ts-ignore
app.use('/users',require('./routers/usersRoute'));


// @ts-ignore
app.get('/', (req,res) => {
  res.send('This is drivvo project');
})

//Check if this users has existed in the system or not? before the registration process
//related folders: BasicMethod - User Method
app.post('/register', Regis_In_Out.register);


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