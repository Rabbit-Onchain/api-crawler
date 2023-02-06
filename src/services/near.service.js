const logger = require('../config/logger');
const config = require('../config/config');
const moment = require('moment');
const httpStatus = require('http-status');
const { NearCrawlHist, NearTokenWhale, NearChanges, NearWhale } = require('../models');
const ApiError = require('../utils/ApiError');
const { delay } = require('../utils/index');
const { crawlThaleTypes } = require('../config/whale');
const { parse } = require('dotenv');

// API count token on near: https://api.nearblocks.io/v1/fts/count?
// API get token: https://api.nearblocks.io/v1/fts?&order=desc&sort=onchain_market_cap&page=1&per_page=50

// RPC on near https://rpc.mainnet.near.org
// for historical data https://archival-rpc.mainnet.near.org

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

// docs : https://docs.near.org/api/rpc/setup 
const crawlNearChanges = async (blockId) => {
  const moduleGot = await import('got');
  // blockId = 84621471
  const {data} = await moduleGot.post(config.rpc_near.main_net, {
	  json: {
		  "jsonrpc": "2.0",
      "id": "dontcare",
      "method": "EXPERIMENTAL_changes_in_block",
      "params": {
        "block_id": blockId
      }
	  }
  }).json();

  if (data && data['result'] && data['result']['changes']) {
    await NearCrawlHist.create({
      c_t: crawlThaleTypes.NEARRPC,
      block_hash: data.result.block_hash,  
      block_id: blockId
    });

    // loop on changes
    let changesType = [], accountIds = [];
    for (let change of data.result.changes) {
      changesType.push({
        c_t: crawlThaleTypes.NEARRPC,
        change_type: change.type 
      }); 

      accountIds.push(change.account_id);

      // analyze accounts
      await crawlNearAccount(change.account_id);
    }

    await NearChanges.insertMany(changesType);
  }
}

const crawlNearAccount = async (accountId) => {
  const moduleGot = await import('got');
  // blockId = 84621471
  const {data} = await moduleGot.post(config.rpc_near.main_net, {
	  json: {
		  "jsonrpc": "2.0",
      "id": "dontcare",
      "method": "query",
      "params": {
        "request_type": "view_account",
        "finality": "final",
        'account_id': accountId
      }
	  }
  }).json();

  if (data && data['result']) {
    await NearWhale.create({
      c_t: crawlThaleTypes.NEARRPC,
      adr: accountId,
      amount: data.result.amount,
      block_hash: data.result.block_hash,  
      block_height: data.result.block_height,
    });
  }
}

module.exports = {
  crawlNearBlockToken,
};
