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
  const min = req.query.min;
  const max = req.query.max;
  for (let b = min; b <= max; b++) {
    await nearService.crawlNearChanges(b);
    delay(1000);
  }

  res.send({});
});

const crawlTokenHolder = catchAsync(async (req, res) => {
  await nearService.crawlTokenHolder();
  // await debankService.createWhale(whaleData);
  res.send({});
});

module.exports = {
  crawlNearToken,
  crawlNearChanges,
  crawlTokenHolder,
};
