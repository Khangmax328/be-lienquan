const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const { getBalanceHistoryByUser } = require('../controllers/balanceHistoryController')

// GET /api/balance-history
router.get('/', verifyToken, getBalanceHistoryByUser)

module.exports = router
