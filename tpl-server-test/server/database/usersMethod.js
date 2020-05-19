const pool = require('./pooling');

module.exports = {
    printall: async (req,res) => {
        try{
            const results = await pool.query('select * from users');
            return res.status(200).send({data: results.rows});
            
        } catch (err) {
            console.log(err);
            return res.sendStatus(404);
        }
    },
    insert: async (req,res) => {
        try {
            const {username, phone, email, pw} = req.body;
            try{
                    await pool.query(`insert into users(u_fullname, u_phone, u_email, u_pw)
                values ($1,$2,$3,$4)`, [username,phone,email,pw]);
                console.log({username, phone, email, pw});
                res.sendStatus(200);
            } catch (err) {
                res.sendStatus(403); }
        } catch (err) {
            res.sendStatus(404);
        }
    }
}