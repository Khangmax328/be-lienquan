const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')
const { getAdminOverview } = require('../controllers/adminStatsController')
const { getTopUsersByOrders } = require('../controllers/adminController')
const { getTopRechargers } = require('../controllers/adminStatsController')
const { getTopBuyers } = require('../controllers/adminStatsController')


router.get('/overview', verifyToken, verifyAdmin, getAdminOverview)
router.get('/top-users', verifyToken, verifyAdmin, getTopUsersByOrders)
router.get('/top-rechargers', getTopRechargers)
router.get('/top-buyers',  getTopBuyers)

module.exports = router
