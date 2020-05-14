'use strict'

module.exports = {
    checkValidRegister: (Users) => {
        return (req,res,next) => {
            const {fullname,phone,email,pw} = req.body;
            const registeredUser = {fullname,phone,email,pw};
            const checkExist = Users.find( user => user.email === email);
          
            //There is no identical user exits within the database => Can register this new user 
            if(checkExist === undefined) {
              req.registeredUser = registeredUser;
              console.log('User info is valid');
              next();
            } //This user has been registered => FAILED
            else {
                console.log('Users info is not valid : Error 403')
                return res.status(403);
            } 
          };
    }
    ,
    extractToken: (req,res,next) => {
        const header = req.headers['authorization'];
        console.log(`Au: ${header}`);
        if(header) return res.send(400);
        const token = header.split(' ')[1];
        req.token = token;
        next();
    }
}