const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');

const napNLReport = require('../report/napNLReport');
const chiphiReport = require('../report/chiphiReport');
const thunhapReport = require('../report/thunhapReport');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('Hello world');
})

router.get('/nll', Auth_IN_OUT.extractToken, async (req,res) => {
    const token = req.token;
    try {
      const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
      const output = await napNLReport.report_NLL(usr_id);
      res.status(200).send(output);
    } catch (err) {
      console.log({ERR: err});
      return res.send({message: 'failed at report route', err});
    }
  }
);

router.get('/chiphi',Auth_IN_OUT.extractToken, async (req,res) => {

  const token = req.token;
  try {
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const data = await chiphiReport.print_report(usr_id);
    return res.send({data});

    /*this is data: 
    {
      entry: {
          entry_chiphi,
          start_date,
          current_date,
          date_diff
      },
      statistics: {
          total_money,
          by_day,
          by_km,
      } 
  }*/

  } catch (err) {
    console.log({ERR: err});
    res.sendStatus(500);
  }
})

router.get('/thunhap', Auth_IN_OUT.extractToken, async (req, res) => {
  const token = req.token;
  try {
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const data = await thunhapReport.print_report(usr_id);
    res.send({data});
  } catch (err) {
    console.log({Err:err});
    res.send(500);
  }
})

module.exports = router;