const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController')
const upload = require('../middleware/uploadCloud')

// Chỉ admin được tạo, sửa, xoá
router.post('/', verifyToken, verifyAdmin, upload.single('image'), createCategory)

router.put('/:id', verifyToken, verifyAdmin, updateCategory)
router.delete('/:id', verifyToken, verifyAdmin, deleteCategory)

// Public: get
router.get('/', getAllCategories)
router.get('/:id', getCategoryById)

module.exports = router
