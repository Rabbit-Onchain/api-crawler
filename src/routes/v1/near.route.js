const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const nearController = require('../../controllers/crawl.nearblocks.controller');

const router = express.Router();

router.get('/crawl-near-tokens', nearController.crawlNearToken);
router.get('/crawl-near-changes', nearController.crawlNearChanges);
router.get('/crawl-token-holder', nearController.crawlTokenHolder);

//example: http://127.0.0.1:3000/v1/near/get-list-token-holder?contractId=token.sweat&page=2&per_page=25
router.get('/get-list-token-holder', nearController.getListHolderByContractId);
router.get('/list', nearController.getNearTokens);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Near
 *   description: api with near
 */

/**
 * @swagger
 * /near/crawl-near-tokens:
 *   get:
 *     summary: Get top near tokens from nearblocks
 *     description: Get top near tokens from nearblocks
 *     tags: [Near]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

/**
 * @swagger
 * /near/crawl-near-changes:
 *   get:
 *     summary: Get block changes
 *     description: Get block changes and crawl each account in blocks
 *     tags: [Near]
 *     parameters:
 *       - in: min
 *         name:
 *         schema:
 *           type: integer
 *         description: min
 *       - in: max
 *         name: max
 *         schema:
 *           type: integer
 *         description: max
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
