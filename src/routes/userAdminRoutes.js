// src/routes/userAdminRoutes.js
const express = require('express')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')
const { getAllUsers, deleteUser, updateUser } = require('../controllers/userController')

router.get('/', verifyToken, verifyAdmin, getAllUsers) // Xem danh sách
router.delete('/:id', verifyToken, verifyAdmin, deleteUser) // Xóa user
router.put('/:id', verifyToken, verifyAdmin, updateUser) // Cập nhật user


module.exports = router
