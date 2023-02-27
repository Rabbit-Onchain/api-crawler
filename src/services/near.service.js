const logger = require('../config/logger');
const config = require('../config/config');
const moment = require('moment');
const httpStatus = require('http-status');
const { NearCrawlHist, NearToken, NearChanges, NearWhale, NearTokenHolder } = require('../models');
const ApiError = require('../utils/ApiError');
const { delay } = require('../utils/index');
const { crawlSources } = require('../config/whale');
const { parse } = require('dotenv');
const { MONGO_ERROR_TYPES, isError } = require('../utils/mongodbCatch');

// API count token on near: https://api.nearblocks.io/v1/fts/count?
// API get token: https://api.nearblocks.io/v1/fts?&order=desc&sort=onchain_market_cap&page=1&per_page=50
// API get lastest block: https://api.nearblocks.io/v1/stats

// RPC on near https://rpc.mainnet.near.org
// for historical data https://archival-rpc.mainnet.near.org

const getNearToken = async (page, per_page) => {
  try {
    per_page = parseInt(per_page);
    let totalPage = 0,
      limit = per_page, totalDocument = 0
    totalDocument = await NearToken.countDocuments({});
    page = parseInt(page) + 1;
    const data = await NearToken.find({}, '').skip((page - 1) * limit).limit(limit);
    return { data, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
  } catch (e) {
    logger.error(e);
  }
}

const crawlNearBlockToken = async () => {
  let numberPage = 0,
    limit = 50,
    totalToken = 0,
    countToken = 0,
    currentCount = 0,
    dbRs;
  let url = '';
  // import dynamic module - import es module
  const moduleGot = await import('got');

  // get number of tokens
  url = `https://api.nearblocks.io/v1/fts/count?`;
  logger.info('get count link: ' + url);

  let { body: rs } = await moduleGot.got.get(url);
  rs = JSON.parse(rs);

  if (rs && rs.tokens && rs.tokens[0]) {
    totalToken = parseInt(rs.tokens[0].count);
    numberPage = Math.ceil(totalToken / limit);

    logger.info(`Total Tokens: ${totalToken}`);
  }

  for (let page = 1; page <= numberPage; page++) {
    url = `https://api.nearblocks.io/v1/fts?&order=desc&sort=onchain_market_cap&page=${page}&per_page=${limit}`;
    logger.info('get link: ' + url);

    let { body: rs } = await moduleGot.got.get(url);
    rs = JSON.parse(rs);

    if (rs && rs.tokens) {
      for (let i in rs.tokens) {
        rs.tokens[i].c_t = crawlSources.NEARBLOCKS;
      }

      currentCount += rs.tokens.length;

      dbRs = await NearToken.insertMany(rs.tokens);
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
  if (!blockId) {
    blockId = 84679490;
  }

  logger.info(`crawling block ${blockId}`);

  try {
    let { body: data } = await moduleGot.got.post(config.rpc_near.main_net, {
      json: {
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'EXPERIMENTAL_changes_in_block',
        params: {
          block_id: blockId,
        },
      },
    });
    logger.info(`data: ${data}`);
    data = JSON.parse(data);

    if (data && data['result'] && data['result']['changes']) {
      await NearCrawlHist.create({
        c_t: crawlSources.NEARRPC,
        block_hash: data.result.block_hash,
        block_id: blockId
      });

      // loop on changes
      let changesType = [],
        accountIds = [];
      for (let change of data.result.changes) {
        changesType.push({
          c_t: crawlSources.NEARRPC,
          change_type: change.type
        });

        accountIds.push(change.account_id);

        // analyze accounts
        await crawlNearAccount(change.account_id);
      }

      await NearChanges.insertMany(changesType);
    }
  } catch (e) {
    console.log(`excaption on block ${blockId}`);
    console.dir(e);
  }
};

const crawlNearAccount = async (accountId) => {
  const moduleGot = await import('got');

  if (!accountId) {
    accountId = "1b56bc105aa76a4fbaadac1e5fed7389c8ea0a16605d63e5b5aaaa04511b9474";
  }

  let { body: data } = await moduleGot.got.post(config.rpc_near.main_net, {
    json: {
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id: accountId,
      },
    },
  });
  data = JSON.parse(data);

  if (data && data['result']) {
    try {
      // upsert
      const doc = await NearWhale.findOneAndUpdate(
        { adr: accountId },
        {
          c_t: crawlSources.NEARRPC,
          adr: accountId,
          amount: data.result.amount / (10 ** 24),    // convert to near
          block_hash: data.result.block_hash,
          block_height: data.result.block_height,
        },
        // If `new` isn't true, `findOneAndUpdate()` will return the
        // document as it was _before_ it was updated.
        { new: true }
      );

      /*
      await NearWhale.create({
        c_t: crawlSources.NEARRPC,
        adr: accountId,
        amount: data.result.amount / (10 ** 24),    // convert to near
        block_hash: data.result.block_hash,  
        block_height: data.result.block_height,
      });
      */
    } catch (e) {
      logger.error(e);
    }
  }
};

const crawlTokenHolder = async () => {
  let numberPage = 0,
    limit = 25,
    totalTokenHolder = 0,
    countToken = 0,
    dbRs;
  let url = '';
  const tokens = await NearToken.find({});
  // logger.info('tokens: ' + tokens);
  let arr_contract_id = [];
  for (let i of tokens) {
    if (!arr_contract_id.includes(String(i.contract))) {
      arr_contract_id.push(String(i.contract));
    }
  }
  // logger.info('arr_contract_id: ' + arr_contract_id);
  // let contract_id = 'token.sweat';
  if (arr_contract_id.length > 0) {
    for (let contract_id of arr_contract_id) {
      logger.info('contract_id: ' + contract_id);
      logger.info(`${countToken}/${arr_contract_id.length} token handled`);
      let currentCount = 0;

      // import dynamic module - import es module
      const moduleGot = await import('got');

      // get number of token holder
      url = `https://api.nearblocks.io/v1/fts/${contract_id}/holders/count`;
      logger.info('get count link: ' + url);
      let { body: rs } = await moduleGot.got.get(url);
      await delay(5000);
      logger.info('rs: ' + rs);
      rs = JSON.parse(rs);

      if (rs && rs.holders && rs.holders[0]) {
        totalTokenHolder = parseInt(rs.holders[0].count);
        numberPage = Math.ceil(totalTokenHolder / limit);

        logger.info(`Total Token Holder: ${totalTokenHolder}`);
      }

      for (let page = 1; page <= 200; page++) {
        url = `https://api.nearblocks.io/v1/fts/${contract_id}/holders?page=${page}&per_page=${limit}`;
        logger.info('get link: ' + url);
        let { body: rs } = await moduleGot.got.get(url);
        await delay(5000);
        rs = JSON.parse(rs);

        if (rs && rs.holders) {
          for (let i in rs.holders) {
            rs.holders[i].c_t = crawlSources.NEARBLOCKS;
            rs.holders[i].contract_id = contract_id;
          }
          currentCount += rs.holders.length;

          dbRs = await NearTokenHolder.insertMany(rs.holders);
          logger.info(`${currentCount}/${totalTokenHolder} holders added`);
        }
      }

      logger.info(`Total holder: ${currentCount}`);
      countToken += 1;
    }
  }

};

const getWhales = async (page, per_page) => {
  try {
    let totalPage = 0,
      limit = per_page, totalDocument = 0
    totalDocument = await Whale.countDocuments({});
    const whales = await Whale.find({}, '').skip((page - 1) * limit).limit(limit);
    return { whales, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
  } catch (e) {
    logger.error(e);
  }
}


const getListHolderByContractId = async (page, per_page, contractId) => {
  let totalPage = 0,
    limit = per_page, totalDocument = 0
  totalDocument = await NearTokenHolder.countDocuments({ contract_id: contractId })
  const holders = await NearTokenHolder.find({ contract_id: contractId }, 'account amount').skip((page - 1) * limit).limit(limit);
  // logger.info('holders: ' + holders);
  // logger.info('totalPage: ' + totalPage);
  // logger.info('page: ' + page);
  return { holders, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
}

const getListToken = async (page, per_page) => {
  let totalPage = 0,
    limit = per_page, totalDocument = 0
  totalDocument = await NearToken.countDocuments({})
  const tokens = await NearToken.find({}).skip((page - 1) * limit).limit(limit);
  logger.info('tokens: ' + tokens);
  logger.info('totalPage: ' + totalPage);
  logger.info('page: ' + page);
  return { tokens, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
}

module.exports = {
  crawlNearBlockToken,
  crawlNearChanges,
  crawlTokenHolder,
  getNearToken,
  getListHolderByContractId,
  getListToken
};
