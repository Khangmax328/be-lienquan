// src/controllers/userController.js
const User = require('../models/UserModel')
const Order = require('../models/OrderModel')
const bcrypt = require('bcryptjs')

const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password')
      if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' })
      res.status(200).json(user)
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error: err.message })
    }
  }
  // Cho user tự cập nhật mật khẩu
  const updatePassword = async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
      if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' })
  
      const { oldPassword, newPassword } = req.body
  
      // Kiểm tra đầu vào
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' })
      }
  
      // So sánh mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' })
      }
  
      // Hash lại mật khẩu mới
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
  
      user.password = hashedPassword
      await user.save()
  
      res.status(200).json({ message: 'Cập nhật mật khẩu thành công' })
    } catch (err) {
      res.status(500).json({ message: 'Lỗi cập nhật mật khẩu', error: err.message })
    }
  }
  
// Admin: lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, email = '' } = req.query;
    const query = email ? { email: { $regex: email, $options: 'i' } } : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách user', error: err.message });
  }
};


// Admin: xoá user
const deleteUser = async (req, res) => {
  // console.log('ID nhận được:', req.params.id)
  try {
    const deleted = await User.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'User không tồn tại' })
    res.status(200).json({ message: 'Xoá user thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá user', error: err.message })
  }
}

// Admin: cập nhật user (email, username, balance, isAdmin)
const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password')

    if (!updated) return res.status(404).json({ message: 'User không tồn tại' })

    res.status(200).json({ message: 'Cập nhật user thành công', user: updated })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật user', error: err.message })
  }
}
const getTopBuyers = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'accountInfo'
        }
      },
      { $unwind: '$accountInfo' },
      {
        $group: {
          _id: '$user', // ID user
          totalSpent: { $sum: '$accountInfo.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          username: '$userInfo.username',
          totalSpent: 1,
          count: 1
        }
      }
    ]

    const topBuyers = await Order.aggregate(pipeline)
    res.status(200).json(topBuyers)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}

module.exports = {
  getAllUsers,
  deleteUser,
  updateUser,
  getUserProfile,
  updatePassword,
  getTopBuyers 
}
