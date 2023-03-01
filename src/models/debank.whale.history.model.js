const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { crawlSources } = require('../config/whale');

// {
//   "cate_id": "receive",
//   "chain": "avax",
//   "other_addr": "0x2efb50e952580f4ff32d8d2122853432bbf2e204",
//   "project_id": null,
//   "receives": [{
//           "amount": 16179.999999999998,
//           "from_addr": "0x2efb50e952580f4ff32d8d2122853432bbf2e204",
//           "price": 17.09,
//           "token_id": "avax"
//       }
//   ],
//   "sends": [
// "amount": 1000360.2443478798,
// "price": 0.9997,
// "to_addr": "0xdecf04ca46d287b3cb99692ad512e568ba276140",
// "token_id": "0x6b175474e89094c44da98b954eedeac495271d0f"
//   ],
//   "time_at": 1677634550.0,
//   "token_approve": null,
//   "tx": {
//           "from_addr": "0x2a82ae142b2e62cb7d10b55e323acb1cab663a26",
//           "name": "",
//           "params": [],
//           "status": 1,
//           "to_addr": "0xfb1bffc9d739b8d520daf37df666da4c687191ea",
//           "value": 0.0
// }
// }

const debankWhaleHistorySchema = mongoose.Schema(
  {
    cate_id: {
      type: String,
    },
    adr: {
      type: String
    },
    chain: {
      type: String,
    },
    other_addr: {
      type: String,
    },
    project_id: {
      type: String,
    },
    receives: [{
      amount: Number,
      from_addr: String,
      price: Number,
      token_id: String
    }],
    sends: [{
      amount: Number,
      price: Number,
      to_addr: String,
      token_id: String
    }],
    time_at: {
      type: Number,
    },
    token_approve: {
      type: String
    },
    tx: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
debankWhaleHistorySchema.plugin(toJSON);

/**
 * @typedef Token
 */
const DebankWhaleHistory = mongoose.model('debankWhaleHistory', debankWhaleHistorySchema);

module.exports = DebankWhaleHistory;
