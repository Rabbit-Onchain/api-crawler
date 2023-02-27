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

const getWhales = catchAsync(async (req, res) => {
  const { page = 1, per_page = 50 } = req.query;
  const data = await debankService.getWhales(page, per_page);
  res.send(data);
});

const getWhaleDetail = catchAsync(async (req, res) => {
  const { adr } = req.query;
  console.log(adr);
  let data = {};
  if (adr) {
    data = await debankService.getWhale(adr);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
  }
  
  res.send(data);
});

module.exports = {
  crawlWhale,
  getWhales,
  getWhaleDetail,
};
