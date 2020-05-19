const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
require('express-async-errors');
const bodyParser = require('body-parser');
const PORT = 3000;
const app = express();

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

//Predefined User Array

/*let Users = [
  {fullname: 'tploc',   phone: '012345', email: 'tploc_gv@gmail.com',  pw: '012345loc'},
  {fullname: 'hqthinh', phone: '023456', email: 'hqthinh_sv@gmail.com', pw: '023456thinh'},
  {fullname: 'vhaquan', phone: '034567', email: 'vhaquan_sv@gmail.com', pw: '034567quan'},
];*/


let Access_Tokens = [];

//Router
app.use('/napnhienlieu',require('./routers/napnhienlieuRoute'));
app.use('/chiphi',require('./routers/chiphiRoute'));
app.use('/thunhap',require('./routers/thunhapRoute'));
app.use('/dichvu',require('./routers/dichvuRoute'));
app.use('/users',require('./routers/usersRoute'));



app.post('/', (req, res) => {
  console.log('someone has called')
  res.json({
    msg: 'hello from nodejs express apidasa1sdadasdas19981111',
  });
})


app.get('/', (req,res) => {
  res.send({helo: 'Hello199811122222'});
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


//app.get('/register',)


/*app.post('/register', Auth_IN_OUT.checkValidRegister(Users) ,(req,res) => {
  Users.push(req.registeredUser);
  console.table(Users);
  console.log('Successful');
  //return res.sendStatus(200);
  return res.status(200).send({mess: 'Yees'});
});*/

/*app.post('/login', async (req,res) => {
  const {email,pw} = req.body;
  const userPayload = {email,pw};
  const checkExist = Users.find(user => user.email === email && user.pw === pw);
  if(checkExist){
    const token = await jwt.sign(userPayload,'highlands');
    Access_Tokens.push(token);
    console.log(token);
    return res.status(200).send({
      message: 'successful',
      token: token,
    });
  } 
  return res.sendStatus(403);
})


app.post('/logout', Auth_IN_OUT.extractToken, (req,res) => {
  //Print the pre-modified Token Array
  //console.table(Access_Tokens);

  jwt.verify(req.token,'highlands', (err,decoded) => {
    if (err) return res.sendStatus(403);
    console.log(decoded);
    //Delete token of the Access_Tokens Array
    Access_Tokens = Access_Tokens.filter(token => token !== req.token)
    //Print out the Access_Token 
    console.table(Access_Tokens);
    //return res.status(200).send('ok');
    return res.sendStatus(200)
  })
})*/



app.listen(PORT, () => {
  console.log(`API is running at http://localhost:${PORT}`);
})




/*app.post('/register',(req,res) => {
  console.log('someone has called register')
  const account = {usernameInternal: 'drivvo', pwInternal: '2020'};
  const {username,pw} = req.body;
  if (username === account.usernameInternal && pw === account.pwInternal)
    return res.status(200).send({message: 'successful'});
  throw createError(401,'account not valid');
});*/

/*app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/users', require('./routes/user.route'));

function verifyAccessToken(req, res, next) {
  // console.log(req.headers);
  const token = req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, 'shhhhh', function (err, payload) {
      if (err) throw createError(403, err);

      console.log(payload);
      next();
    });
  } else {
    throw createError(401, 'NO_TOKEN');
  }
}

// app.use('/api/categories', verifyAccessToken, require('./routes/category.route'));
app.use('/api/categories', require('./routes/category.route'));

app.use((req, res, next) => {
  throw createError(404, 'Resource not found.');
})

app.use(function (err, req, res, next) {
  if (typeof err.status === 'undefined' || err.status === 500) {
    console.error(err.stack);
    console.log(err);
    res.status(500).send('View error log on console.');
  } else {
    console.log(err);
    res.status(err.status).send(err);
  }
})
*/
