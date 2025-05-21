const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  provider: { type: String, required: true, enum: ['Viettel', 'Mobifone', 'Vinaphone'] },
  amount: { type: Number, required: true },
  cardCode: { type: String, required: true },
  serial: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'used', 'invalid'], default: 'pending' },
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
