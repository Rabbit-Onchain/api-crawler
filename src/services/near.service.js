const logger = require('../config/logger');
const moment = require('moment');
const httpStatus = require('http-status');
const { Whale, NearTokenWhale  } = require('../models');
const ApiError = require('../utils/ApiError');
const { delay } = require('../utils/index');
const { crawlThaleTypes } = require('../config/whale');
const { parse } = require('dotenv');

// API count token on near: https://api.nearblocks.io/v1/fts/count?
// API get token: https://api.nearblocks.io/v1/fts?&order=desc&sort=onchain_market_cap&page=1&per_page=50

const crawlNearBlockToken = async () => {
  let numberPage = 0, limit = 50,
    totalToken = 0, countToken = 0, currentCount = 0, dbRs;
  let url = '';
  // import dynamic module - import es module
  const moduleGot = await import('got');

  // get number of tokens
  url = `https://api.nearblocks.io/v1/fts/count?`
  logger.info('get count link: ' + url);
    
  let { body: rs } = await moduleGot.got.get(url);
  rs = JSON.parse(rs);

  if (rs && rs.tokens && rs.tokens[0]) {
    totalToken = parseInt(rs.tokens[0].count);   
    numberPage = Math.ceil(totalToken / limit);

    logger.info(`Total Tokens: ${totalToken}`);
  }

  for (let page = 1; page <= numberPage; page++) {
    url = `https://api.nearblocks.io/v1/fts?&order=desc&sort=onchain_market_cap&page=${page}&per_page=${limit}`
    logger.info('get link: ' + url);
    
    let { body: rs } = await moduleGot.got.get(url);
    rs = JSON.parse(rs);

    if (rs && rs.tokens) {            
      for(let i in rs.tokens) {
        rs.tokens[i].c_t = crawlThaleTypes.NEARBLOCKS;
      }

      currentCount += rs.tokens.length;

      dbRs = await NearTokenWhale.insertMany(rs.tokens);
      logger.info(`${currentCount}/${totalToken} tokens added`);
      await delay(5000);
    }
  }

  logger.info(`Total Token: ${currentCount}`);
};

module.exports = {
  crawlNearBlockToken,
};
