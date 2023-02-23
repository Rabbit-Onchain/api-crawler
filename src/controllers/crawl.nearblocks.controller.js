const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { nearService } = require('../services');
const { delay } = require('../utils/index');

// crawl near tokens
const crawlNearToken = catchAsync(async (req, res) => {
  nearService.crawlNearBlockToken();
  // await debankService.createWhale(whaleData);
  res.send({});
});

/**
 * Get near tokens
 */
const getNearTokens = catchAsync(async (req, res) => {
  const { page = 1, per_page = 50 } = req.query;
  const data = await nearService.getNearToken(page, per_page);
  res.send(data);
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

const getListHolderByContractId = catchAsync(async (req, res) => {
  const { page = 1, contractId, per_page = 50 } = req.query;
  if (!contractId) {
    res.status(400).send("Miss contractId")
    return
  }
  const data = await nearService.getListHolderByContractId(page, per_page, contractId);
  res.send(data);
});

module.exports = {
  crawlNearToken,
  crawlNearChanges,
  crawlTokenHolder,
  getNearTokens,
  getListHolderByContractId
};
