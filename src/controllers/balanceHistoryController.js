const BalanceHistory = require('../models/BalanceHistoryModel')

// [GET] Lấy lịch sử thay đổi số dư
const getBalanceHistoryByUser = async (req, res) => {
  try {
    const history = await BalanceHistory.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json(history)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử số dư', error: err.message })
  }
}

module.exports = { getBalanceHistoryByUser }
