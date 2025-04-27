const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập!' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY')
    
    // 🟡 Tải full thông tin user từ DB để có balance, isAdmin, ...
    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' })

    req.user = user
    next()
  } catch (err) {
    res.status(403).json({ message: 'Token không hợp lệ!', error: err.message })
  }
}

const verifyAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Bạn không có quyền admin!' })
  }
  next()
}

module.exports = {
  verifyToken,
  verifyAdmin,
}
