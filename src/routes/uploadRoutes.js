const express = require('express')
const router = express.Router()
const cloudinary = require('../utils/cloudinary')  // đúng đường dẫn
const multer = require('multer')
const { verifyToken } = require('../middleware/authMiddleware')

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) return res.status(500).json({ message: 'Lỗi upload', error })
      return res.status(200).json({ url: result.secure_url })
    }).end(req.file.buffer)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
})
router.post('/multiple', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const uploaded = await Promise.all(
      req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
            if (err) return reject(err);
            resolve({ url: result.secure_url });
          }).end(file.buffer);
        });
      })
    );
    res.status(200).json(uploaded);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router
