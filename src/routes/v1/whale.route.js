const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const debankController = require('../../controllers/crawl.debank.controller');

const router = express.Router();

// crawl
// router.get('/crawl-debank-whale', auth('crawlWhales'), debankController.crawlWhale);
router.get('/crawl-debank-whale', debankController.crawlWhale);
router.get('/crawl-debank-whale-detail', debankController.crawlWhaleDetail);

// api
router.get('/list', debankController.getWhales);
router.get('/get-whale', debankController.getWhaleDetail);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Whale
 *   description: api whale
 */

/**
 * @swagger
 * /whale/crawl-debank-whale:
 *   get:
 *     summary: Get whales from debank
 *     description: Get whales from debank
 *     tags: [Whale]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
