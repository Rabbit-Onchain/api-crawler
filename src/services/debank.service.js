const logger = require('../config/logger');
const moment = require('moment');
const httpStatus = require('http-status');
const { Whale } = require('../models');
const ApiError = require('../utils/ApiError');
const { delay } = require('../utils/index');
const { crawlSources } = require('../config/whale');

const crawlDebankWhale = async () => {
  let start = 0, limit = 100, hasWhale = true, 
    totalWhale = 0, countWhale = 0, currentCount = 0, dbRs, i = 0;
  let url = `https://api.debank.com/whale/list?start=${start}&limit=${limit}&order_by=-usd_value`
  // import dynamic module - import es module
  const moduleGot = await import('got');
  
  while (hasWhale) {
    url = `https://api.debank.com/whale/list?start=${start}&limit=${limit}&order_by=-usd_value`
    logger.info('get link: ' + url);
    
    let { body: rs } = await moduleGot.got.get(url);
    rs = JSON.parse(rs);

    console.dir('total whales: '+ rs.data.total_count);

    totalWhale = rs.data.total_count; 

    if (rs && rs.data.whales) {      
      countWhale += rs.data.whales.length;
      
      for(let i in rs.data.whales) {
        rs.data.whales[i].c_t = crawlSources.DEBANK;
        rs.data.whales[i].adr = rs.data.whales[i].id;
        delete rs.data.whales[i].id;
        // await Whale.create(whale);
        currentCount++;
        //logger.info(`${currentCount} whale added into DB`);
      }

      dbRs = await Whale.insertMany(rs.data.whales);
      logger.info(`${currentCount}/${totalWhale} whales added`);
      await delay(5000);

      // TODO: delete avatar of tokens
    }

    hasWhale = (countWhale < totalWhale);
    start += limit;
  }

  logger.info(`Total whale: ${currentCount}`);
};

const getWhales = async (page, per_page) => {
  try {
    per_page = parseInt(per_page);
    let totalPage = 0,
    limit = per_page, totalDocument = 0
    totalDocument = await Whale.countDocuments({});
    page = parseInt(page) + 1;
    const whales = await Whale.find({ }, '').skip((page - 1) * limit).limit(limit);
    return { whales, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
  } catch(e) {
    logger.error(e);
  }
}

// get detail of whale
const getWhale = async (address) => {
  try {
    const whale = await Whale.findOne({ 
      adr: address 
    });
    return { whale};
  } catch(e) {
    logger.error(e);
  }
}

module.exports = {
  crawlDebankWhale,
  getWhales,
  getWhale
};
