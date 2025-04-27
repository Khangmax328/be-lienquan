const Category = require('../models/CategoryModel')

// Tạo danh mục (có ảnh)
const createCategory = async (req, res) => {
  try {
    const name = req.body.name; // <-- Lấy rõ ràng từ req.body
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Ảnh không hợp lệ' });
    }

    const exist = await Category.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    const newCategory = await Category.create({
      name,
      image: {
        url: req.file.path,
        public_id: req.file.filename,
      }
    });

    res.status(201).json({ message: 'Tạo danh mục thành công', category: newCategory });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo danh mục', error: err.message });
  }
};


// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: err.message })
  }
}

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' })
    res.status(200).json(category)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: err.message })
  }
}

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, image },
      { new: true }
    )

    if (!updated) return res.status(404).json({ message: 'Không tìm thấy danh mục' })
    res.status(200).json({ message: 'Cập nhật thành công', category: updated })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật danh mục', error: err.message })
  }
}

// Xoá danh mục
const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy danh mục' })
    res.status(200).json({ message: 'Xoá thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá danh mục', error: err.message })
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
}
