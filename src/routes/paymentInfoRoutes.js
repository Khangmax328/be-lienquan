const express = require('express')
const router = express.Router()


const uploadCloud = require('../middleware/uploadCloud')
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')


const {
  createPaymentInfo,
  getAllPaymentInfo,
  updatePaymentInfo,
  deletePaymentInfo
} = require('../controllers/paymentInfoController')

// Tạo mới thông tin nạp (admin)
router.post(
  '/',
  verifyToken,
  verifyAdmin,
  uploadCloud.single('qrImage'),  // giống bên account
  createPaymentInfo
)

// Lấy tất cả (ai cũng được xem)
router.get('/', getAllPaymentInfo)

// Cập nhật (admin)
router.put(
  '/:id',
  verifyToken,
  verifyAdmin,
  uploadCloud.single('qrImage'),
  updatePaymentInfo
)

// Xoá (admin)
router.delete(
  '/:id',
  verifyToken,
  verifyAdmin,
  deletePaymentInfo
)

module.exports = router
