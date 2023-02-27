const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const nearController = require('../../controllers/crawl.nearblocks.controller');

const router = express.Router();

router.get('/crawl-near-tokens', nearController.crawlNearToken);
router.get('/crawl-near-changes', nearController.crawlNearChanges);
router.get('/crawl-token-holder', nearController.crawlTokenHolder);
router.get('/get-list-token-holder', nearController.getListHolderByContractId);
router.get('/list', nearController.getNearTokens);
router.get('/get-list-token', nearController.getListToken);

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

/**
 * @swagger
 * /near/crawl-token-holder:
 *   get:
 *     summary: Crawl top Near Token Holders from Nearblocks
 *     description: Crawl top Near Token Holders from Nearblocks and save it to the Database
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
 * /near/get-list-token-holder:
 *   get:
 *     summary: Get list top Near Token Holders
 *     description: Get list top Near Token Holders
 *     tags: [Near]
 *     parameters:
 *       - in: contractId
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: ContractId
 *       - in: page
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: per_page
 *         name: per_page
 *         schema:
 *           type: integer
 *         description: Amount of holders per a page
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
 * /near/get-list-token:
 *   get:
 *     summary: Get list top Near Token 
 *     description: Get list top Near Token 
 *     tags: [Near]
 *     parameters:
 *       - in: page
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: per_page
 *         name: per_page
 *         schema:
 *           type: integer
 *         description: Amount of tokens per a page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
