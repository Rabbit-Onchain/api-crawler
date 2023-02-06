const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { nearService } = require('../services');

const crawlNearToken = catchAsync(async (req, res) => {

  nearService.crawlNearBlockToken();

  // await debankService.createWhale(whaleData);

  res.send({});
});

const crawlNearChanges = catchAsync(async (req, res) => {

  nearService.crawlNearChanges();

  res.send({});
});


module.exports = {
  crawlNearToken,
  crawlNearChanges,
};
