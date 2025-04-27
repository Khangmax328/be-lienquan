const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  paidAt: {
    type: Date
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
