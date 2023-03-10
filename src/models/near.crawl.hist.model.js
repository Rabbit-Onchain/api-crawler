const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlSources } = require('../config/whale');

const nearCrawlHistSchema = mongoose.Schema(
  {
    c_t: {
      type: Number,
      enum: [crawlSources.NEARRPC],
      required: true,
    },
    block_hash: {
      type: String,
      required: false,
    },
    block_id: {
      type: Number,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
nearCrawlHistSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const NearCrawlHist = mongoose.model('near_crawl_hist', nearCrawlHistSchema);

module.exports = NearCrawlHist;
