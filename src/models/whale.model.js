const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlWhaleTypes } = require('../config/whale');

const whaleSchema = mongoose.Schema(
  {
    c_t: {      // crawl type: DEBANK, NEARBLOCKS ....
      type: Number,
      enum: [crawlWhaleTypes.DEBANK],
      required: true,
    },
    adr: {
      type: String,
      required: true,
    },
    desc: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    org: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    stats: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    usd_value: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
whaleSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const Whale = mongoose.model('whale', whaleSchema);

module.exports = Whale;
