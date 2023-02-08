const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { debankService } = require('../services');

const crawlWhale = catchAsync(async (req, res) => {
  await debankService.crawlDebankWhale();
  // await debankService.createWhale(whaleData);
  res.send({});
});

module.exports = {
  crawlWhale,
};
