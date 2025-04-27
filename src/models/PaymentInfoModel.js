
const mongoose = require('mongoose')

const paymentInfoSchema = new mongoose.Schema({
  accountNumber: String,
  bankName: String,
  fullName: String,
  transferNote: String,
  qrImage: {
    url: String,
    public_id: String,
  },
}, { timestamps: true })

module.exports = mongoose.model('PaymentInfo', paymentInfoSchema)
