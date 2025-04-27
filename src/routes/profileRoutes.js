const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Lấy thông tin profile thành công',
    user: req.user, // được gắn từ middleware
  })
})

module.exports = router
