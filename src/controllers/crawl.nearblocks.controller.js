const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { nearService } = require('../services');
const { delay } = require('../utils/index');

const crawlNearToken = catchAsync(async (req, res) => {
  nearService.crawlNearBlockToken();
  // await debankService.createWhale(whaleData);
  res.send({});
});

const crawlNearChanges = catchAsync(async (req, res) => {
  let maxId = 84679490;
  for (let b = 84678490; b <= maxId; b++) {
    console.log('analyze block ' + b);
    await nearService.crawlNearChanges(b);
    delay(1000);
  }
  
  res.send({});
});


module.exports = {
  crawlNearToken,
  crawlNearChanges,
};
