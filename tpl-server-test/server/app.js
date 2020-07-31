require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
require('express-async-errors');
//======================================= >< =======================================
const bodyParser = require('body-parser');
const PORT = 3000;
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
  res.send('This is drivvo project');
})

app.get('/nhacnho/test_1', Auth_IN_OUT.extractToken, async (req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const date = await nhacnhoMethod.print_1_nhacnho(usr_id);
    res.status(200).send({title: 'one time nhac nho', date});

  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})
//Check if this users has existed in the system or not? before the registration process
//related folders: BasicMethod - User Method
app.post('/register', Regis_In_Out.register);

app.post('/sign_in_gg', Regis_In_Out.signIN_gg);
// Check if the user has exsited in the system or not? if it has, then send them to token
//Related Folder: BasicMethod - User Method (check valid user)- Token Method (insert token)
app.post('/login', Regis_In_Out.login);

//Check if the token sent by the customer exists in the system before allowing them to logout
//Related Files/Folder: BasicMethod - Token Method - Auth_In_Out
app.post('/logout', Auth_IN_OUT.extractToken, Regis_In_Out.logout);

app.listen(PORT, () => {
  console.log(`API is running at http://localhost:${PORT}`);
});