const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlThaleTypes } = require('../config/whale');

const nearTokenHolderSchema = mongoose.Schema(
  {
    c_t: {
      type: Number,
      enum: [crawlThaleTypes.NEARBLOCKS],
      required: true,
    },
    contract_id: {
      type: String,
      required: true,
    },
    account: {
      type: String,
      require: true,
    },
    amount: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
nearTokenHolderSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const NearTokenHolder = mongoose.model('near_token_holder', nearTokenHolderSchema);

module.exports = NearTokenHolder;
