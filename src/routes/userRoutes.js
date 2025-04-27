const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')

const User = require('../models/UserModel')
const { updatePassword, getUserProfile, getTopBuyers } = require('../controllers/userController')

router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách user', error: err.message })
  }
})

router.get('/me', verifyToken, getUserProfile)
router.get('/top-buyers', getTopBuyers)
router.put('/update-password', verifyToken, updatePassword)

module.exports = router
