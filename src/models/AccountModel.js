const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  champions: { type: Number, default: 0 },
  skins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  rank: { type: String, default: '' },

  // Ảnh đại diện (hiển thị ở Home)
  image: {
    url: String,
    public_id: String,
  },

  // Danh sách ảnh chi tiết
  images: [
    {
      url: String,
      public_id: String,
    }
  ],

  username: { type: String, required: true },
  password: { type: String, required: true },
  authCode: { type: String },
  isSold: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Account', accountSchema)

