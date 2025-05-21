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
router.put('/update-balance', verifyToken, verifyAdmin, async (req, res) => {
  const { email, amount } = req.body;
  try {
    console.log("Yêu cầu cập nhật số dư:", email, amount);

    if (!email || isNaN(amount)) {
      return res.status(400).json({ message: 'Thiếu hoặc sai định dạng email/amount' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Không tìm thấy user với email:", email);
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance = Number(user.balance || 0) + Number(amount);
    await user.save();

    console.log("Đã cập nhật số dư thành công cho:", email);
    res.json({ message: 'Cập nhật số dư thành công' });
  } catch (err) {
    console.error("Lỗi cập nhật số dư:", err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router
