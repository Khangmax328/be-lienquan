const mongoose = require('mongoose')

const balanceHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  change: { type: Number, required: true }, // Số tiền thay đổi (+ hoặc -)
  type: { type: String, enum: ['increase', 'decrease'], required: true },
  reason: { type: String }, // Ghi chú lý do thay đổi (mua acc, admin nạp,...)
  balanceAfter: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('BalanceHistory', balanceHistorySchema)