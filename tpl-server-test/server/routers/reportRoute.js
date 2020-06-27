const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');

const napNLReport = require('../report/napNLReport');
const chiphiReport = require('../report/chiphiReport');
const thunhapReport = require('../report/thunhapReport');
const dichvuReport = require('../report/dichvuReport');
const calculationNLL = require('../report/calculationNLL');

const router = express.Router();


router.get('/calculation', Auth_IN_OUT.extractToken, async (req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const result_calculation = await calculationNLL.average_nll_each_form(usr_id);
    res.status(200).send(result_calculation);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})



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
    const {entry, statistics} = await chiphiReport.print_report(usr_id);
    return res.send({entry, statistics});

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
    const {entry, statistics }= await thunhapReport.print_report(usr_id);
    res.send({entry, statistics});
  } catch (err) {
    console.log({Err:err});
    res.send(500);
  }
})

router.get('/dichvu', Auth_IN_OUT.extractToken, async (req,res) => {
  const token = req.token;

  try {
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const entry_time = await dichvuReport.print_report(usr_id);

    const {total_entry_time, days, money_spent, by_date, by_km} = entry_time;

    const entry = {entry_dichvu: total_entry_time, start_date: days.start_date, current_date: days.current_date, date_diff: days.date_diff};
    const statistics = {
      total_money: money_spent, by_date, by_km
    };
    const data = {entry, statistics}

    res.status(200).send({entry, statistics});
    
  } catch (err) {
    console.log({Err: err});
  }
}) 



module.exports = router;