const logger = require('../config/logger');
const moment = require('moment');
const httpStatus = require('http-status');
const { Whale } = require('../models');
const ApiError = require('../utils/ApiError');
const { delay } = require('../utils/index');
const { crawlSources } = require('../config/whale');
const download = require('image-downloader');
const { Logo } = require('../models');
const { token } = require('morgan');
const path = require('path');
const fs = require('fs');

// crawl whales from debank
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
                await Logo.findOneAndUpdate({ token: tokenOfWhale['symbol'] }, {
                  token: tokenOfWhale['symbol'],
                  logo_url: path.join('public/images', tokenOfWhale['symbol'], arr[arr.length - 1])
                }, { upsert: true });
              }
              // TODO: update link of logo_url 
            }
          }
        }

      }
      dbRs = await Whale.insertMany(rs.data.whales);
      logger.info(`${currentCount}/${totalWhale} whales added`);
      await delay(5000);
    }

    hasWhale = (countWhale < totalWhale);
    start += limit;
  }

  logger.info(`Total whale: ${currentCount}`);
};

// crawl whale detail from debank
// debank api: https://api.debank.com/token/cache_balance_list?user_addr=0x73af3bcf944a6559933396c1577b257e2054d935
const crawlWhaleDetail = async() => {
  let limit = 50, totalDocument = 0, totalHandled = 0, page = 1;
  totalDocument = await Whale.countDocuments({});
  let whales, url;
  const moduleGot = await import('got');

  while (totalHandled < totalDocument) {
    whales = await Whale.find({}, '').skip((page - 1) * limit).limit(limit).sort({'stats.usd_value': 'desc'});

    if (whales) {
      for (let whale of whales) {
        totalHandled++;
        page++;
        url = `https://api.debank.com/token/cache_balance_list?user_addr=${whale['adr']}`
        logger.info('get link: ' + url);
        let { body: rs } = await moduleGot.got.get(url);
        rs = JSON.parse(rs);

        whale['stats']['balance_list'] = rs;

        await Whale.findOneAndUpdate({ adr: whale['adr'] }, {
          adr: whale['adr'],
          stats: whale['stats']
        }, { upsert: true });

        console.log(`updated adr ${whale['adr']}`)
      }
    }

  }    
}

const getWhales = async (page, per_page) => {
  try {
    per_page = parseInt(per_page);
    let totalPage = 0,
      limit = per_page, totalDocument = 0
    totalDocument = await Whale.countDocuments({});
    page = parseInt(page) + 1;
    const whales = await Whale.find({}, '').skip((page - 1) * limit).limit(limit).sort({'stats.usd_value': 'desc'});
    return { whales, totalDocument, totalPage: Math.floor(totalDocument / limit), currentPage: page };
  } catch (e) {
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
  getWhale,
  crawlWhaleDetail
};
