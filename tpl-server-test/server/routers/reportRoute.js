const express = require('express');
const Auth_IN_OUT = require('../auth/Auth_IN_OUT');

const napNLReport = require('../report/napNLReport');
const chiphiReport = require('../report/chiphiReport');
const thunhapReport = require('../report/thunhapReport');
const dichvuReport = require('../report/dichvuReport');
const generalReport = require('../report/generalReport');
const fuel_efficiency = require('../report/fuel_efficiency');

//Import Chart Functions
const dichvuChart = require('../charts/dichvuChart');
const chiphiChart = require('../charts/chiphiChart');
const thunhapChart = require('../charts/thunhapChart');

const router = express.Router();

router.get('/', (req,res) => {
    res.send('Hello world');
})

//////////////////////////// GENERAL ///////////////////////////////

router.get('/general', Auth_IN_OUT.extractToken, async (req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);

    // This is the core function of the API  
    const general_report = await generalReport.print_general(usr_id);

    res.status(200).send({general_report});
  } catch (err) { 
    console.log({ERR:err});
    res.sendStatus(500);
  }
});



//////////////////////////// NAP NHIEN LIEU ///////////////////////////////
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

//////////////////////////// CHI PHI ///////////////////////////////
router.get('/chiphi',Auth_IN_OUT.extractToken, async (req,res) => {

  const token = req.token;
  try {
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const {entry, statistics} = await chiphiReport.print_report(usr_id);
    return res.send({entry, statistics});

  } catch (err) {
    console.log({ERR: err});
    res.sendStatus(500);
  }
})

router.get('/chiphi/chart_1', Auth_IN_OUT.extractToken, async (req, res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const chiphi_chart1 = await chiphiChart.chart_1(usr_id);
    return res.status(200).send({chiphi_chart1});
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
})

//////////////////////////// THUNHAP ///////////////////////////////
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

router.get('/thunhap/chart_1', Auth_IN_OUT.extractToken, async (req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const thunhap_chart1 = await thunhapChart.chart_1(usr_id);
    res.status(200).send({thunhap_chart1});
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})

//////////////////////////// DICH VU ///////////////////////////////
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

router.get('/dichvu/chart_1', Auth_IN_OUT.extractToken, async(req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const dichvu_chart1 = await dichvuChart.chart_1(usr_id);
    res.status(200).send({dichvu_chart1});
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
})

// //////////////////////////// ADDITIONALS ///////////////////////////////
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

router.get('/fuel_efficiency', Auth_IN_OUT.extractToken, async (req,res) => {
  try {
    const token = req.token;
    const usr_id = await Auth_IN_OUT._usr_id_from_token(token);
    const data = await fuel_efficiency.print_fuel_efficiency(usr_id);
    res.status(200).send({data});

  } catch (err) {
    console.log({Err: err});
    res.sendStatus(500);
  }
})


module.exports = router;