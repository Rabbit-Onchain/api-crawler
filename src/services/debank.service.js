const logger = require('../config/logger');
const moment = require('moment');
const httpStatus = require('http-status');
const { Whale } = require('../models');
const ApiError = require('../utils/ApiError');
const { delay } = require('../utils/index');
const { crawlSources } = require('../config/whale');
const download = require('image-downloader');
const { Logo, DebankWhaleHistory } = require('../models');
const { token } = require('morgan');
const path = require('path');
const fs = require('fs');


const crawlDebankWhale = async () => {
  // lấy đường dẫn thư mục gốc
  let pathSrc = __dirname;
  let arr_temp = pathSrc.split(/\\/)
  if (arr_temp.length > 0) {
    arr_temp.pop();
    arr_temp.pop();
  }
  pathSrc = path.join(...arr_temp)

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

    console.dir('total whales: ' + rs.data.total_count);

    totalWhale = rs.data.total_count;

    if (rs && rs.data.whales) {
      countWhale += rs.data.whales.length;

      for (let i in rs.data.whales) {
        rs.data.whales[i].c_t = crawlSources.DEBANK;
        rs.data.whales[i].adr = rs.data.whales[i].id;
        delete rs.data.whales[i].id;
        // await Whale.create(whale);
        currentCount++;
        //logger.info(`${currentCount} whale added into DB`);
        //download logo token
        if (rs.data.whales[i]['stats'] && rs.data.whales[i]['stats']['top_tokens'] && rs.data.whales[i]['stats']['top_tokens'].length > 0) {
          for (let tokenOfWhale of rs.data.whales[i]['stats']['top_tokens']) {
            if (tokenOfWhale['logo_url']) {
              // Kiểm tra xem folder có tồn tại không
              if (!fs.existsSync(path.join(pathSrc, 'public/images', tokenOfWhale['symbol']))) {
                // Nếu không tồn tại thì tạo mới
                fs.mkdirSync(path.join(pathSrc, 'public/images', tokenOfWhale['symbol']));
              }
              const { filename } = await download.image({
                url: tokenOfWhale['logo_url'],
                dest: path.join(pathSrc, 'public/images', tokenOfWhale['symbol']),
              })
              let arr = filename.split(/\\/)
              if (tokenOfWhale['symbol']) {
                // nếu trong db đã lưu thông tin logo token thì update còn không thì tạo mới
                let pathLogo = path.join(tokenOfWhale['symbol'], arr[arr.length - 1])
                await Logo.findOneAndUpdate({ token: tokenOfWhale['symbol'] }, {
                  token: tokenOfWhale['symbol'],
                  logo_url: pathLogo
                }, { upsert: true });
                tokenOfWhale.logo_url = pathLogo
              }
            }
          }
        }

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
    const whales = await Whale.find({}, '').skip((page - 1) * limit).limit(limit);
    return { whales, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
  } catch (e) {
    logger.error(e);
  }
}

const crawlDebankWhaleHistory = async () => {
  let start = 0, limit = 20, dbRs
  totalWhale = 0, countWhale = 0, currentCount = 0, url = "", i = 1;
  // import dynamic module - import es module
  const moduleGot = await import('got');
  let whales = await Whale.find({})
  totalWhale = whales.length
  for (let whale of whales) {
    start = Math.floor(Date.now() / 1000); // lấy thời gian hiện tại
    let hasHistory = true;
    while (hasHistory) {
      url = `https://api.debank.com/history/list?user_addr=${whale.adr}&chain=&start_time=${start}&page_count=${limit}`
      logger.info('get link: ' + url);
      let { body: rs } = await moduleGot.got.get(url);
      rs = JSON.parse(rs);
      await delay(10000);
      if (rs && rs.data.history_list && rs.data.history_list.length > 0) {
        for (let i in rs.data.history_list) {
          rs.data.history_list[i].adr = whale.adr;
          rs.data.history_list[i]["tx"] = JSON.stringify(rs.data.history_list[i]["tx"])
          rs.data.history_list[i]["token_approve"] = JSON.stringify(rs.data.history_list[i]["token_approve"])
          delete rs.data.history_list[i].id;
        }
        dbRs = await DebankWhaleHistory.insertMany(rs.data.history_list);
        logger.info(`${rs.data.history_list.length} history of addr whale (${whale.adr}) added`);
        start = rs.data.history_list[rs.data.history_list.length - 1].time_at
      } else {
        hasHistory = false
      }
    }
    logger.info(`executed ${i}/${totalWhale} whalevm`)
    i++;
  }
};

module.exports = {
  crawlDebankWhale,
  getWhales,
  crawlDebankWhaleHistory,
};
