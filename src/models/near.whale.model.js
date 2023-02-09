const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlWhaleTypes } = require('../config/whale');

const nearWhaleSchema = mongoose.Schema(
  {
    c_t: {      // crawl type: DEBANK, NEARBLOCKS , NEARRPC....
      type: Number,
      enum: [crawlWhaleTypes.NEARRPC],
      required: true,
    },
    adr: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: false,
    },
    block_hash: {
      type: String,
      required: false,
    },
    block_height: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
nearWhaleSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const NearWhale = mongoose.model('whale_near', nearWhaleSchema);

module.exports = NearWhale;
