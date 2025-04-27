// routes/orderRoutes.js
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const { createOrder, getMyOrders, getOrderDetails, deleteMyOrder } = require('../controllers/orderController')

router.post('/', verifyToken, createOrder)
router.get('/my', verifyToken, getMyOrders)
router.get('/:id', verifyToken, getOrderDetails)
router.delete('/:id', verifyToken, deleteMyOrder)

module.exports = router
