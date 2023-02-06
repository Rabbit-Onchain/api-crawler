const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlThaleTypes } = require('../config/whale');

const nearWhaleSchema = mongoose.Schema(
  {
    c_t: {      // crawl type: DEBANK, NEARBLOCKS , NEARRPC....
      type: Number,
      enum: [crawlThaleTypes.NEARRPC],
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
const NearWhale = mongoose.model('whale', nearWhaleSchema);

module.exports = NearWhale;
