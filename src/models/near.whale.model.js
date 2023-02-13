const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlSources } = require('../config/whale');

// index on adr (unique) and amount
// db.near_whales.createIndex( { "adr": 1 }, { unique: true } )
// db.near_whales.createIndex( { "amount": -1 } )

const nearWhaleSchema = mongoose.Schema(
  {
    c_t: {      // crawl type: DEBANK, NEARBLOCKS , NEARRPC....
      type: Number,
      enum: [crawlSources.NEARRPC],
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
const NearWhale = mongoose.model('near_whales', nearWhaleSchema);

module.exports = NearWhale;
