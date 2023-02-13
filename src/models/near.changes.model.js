const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlSources } = require('../config/whale');

const nearChangesSchema = mongoose.Schema(
  {
    c_t: {
      type: Number,
      enum: [crawlSources.NEARRPC],
      required: true,
    },
    change_type: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
nearChangesSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const NearTokenChanges = mongoose.model('near_changes', nearChangesSchema);

module.exports = NearTokenChanges;
