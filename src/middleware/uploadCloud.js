// middlewares/upload.js
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { v2: cloudinary } = require('cloudinary')

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shoplienquan', // tên folder lưu ảnh trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
})

const upload = multer({ storage })

module.exports = upload
