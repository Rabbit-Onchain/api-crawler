// const got = require('got');
const httpStatus = require('http-status');
const { Whale } = require('../models');
const ApiError = require('../utils/ApiError');
const { whaleTypes } = require('../config/whale');

const crawlDebankWhale = async () => {
  let start = 0, limit = 40, hasWhale = true, totalWhale = 0, countWhale = 0;
  let url = `https://api.debank.com/whale/list?start=${start}&limit=${limit}&order_by=-usd_value`
  // import dynamic module - import es module
  const moduleGot = await import('got');
  
  while (hasWhale) {
    url = `https://api.debank.com/whale/list?start=${start}&limit=${limit}&order_by=-usd_value`
    console.log('get link: ' + url);
    
    let { body: rs } = await moduleGot.got.get(url);
    rs = JSON.parse(rs);

    console.dir('number whales: '+ rs.data.whales.length);
    console.dir('total whales: '+ rs.data.total_count);

    totalWhale = rs.data.total_count; 

    if (rs && rs.data.whales) {
      countWhale += rs.data.whales.length; 
      
      for(let whale of rs.data.whales) {
        whale.type = whaleTypes.DEBANK;
        whale.adr = whale.id;
        delete whale.id;

        await Whale.create(whale);
      }
    }

    hasWhale = (countWhale < totalWhale);
    start += limit;
  }
};

module.exports = {
  crawlDebankWhale,
};
