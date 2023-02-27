const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const logoSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    logo_url: {
      type: String,
      required: true,
    },

  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
logoSchema.plugin(toJSON);

/**
 * @typedef Logo
 */
const Logo = mongoose.model('Logo', logoSchema);

module.exports = Logo;
