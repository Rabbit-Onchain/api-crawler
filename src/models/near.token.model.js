const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlSources } = require('../config/whale');

const nearTokenSchema = mongoose.Schema(
  {
    c_t: {
      type: Number,
      enum: [crawlSources.NEARBLOCKS],
      required: true,
    },
    onchain_market_cap: {
      type: Number,
      required: false,
    },
    contract: {
      type: String,
      required: false,
    },
    transfers: {
      type: Number,
      required: false,
    },
    holders: {
      type: Number,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    symbol: {
      type: String,
      required: false,
    },
    decimals: {
      type: Number,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
    reference: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    change_24: {
      type: Number,
      required: false,
    },
    market_cap: {
      type: Number,
      required: false,
    },
    volume_24h: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
nearTokenSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const NearToken = mongoose.model('near_token', nearTokenSchema);

module.exports = NearToken;
