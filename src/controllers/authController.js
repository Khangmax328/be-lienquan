const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const register = async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;
  
      // Check confirm password
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp!' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email đã được sử dụng' });
  
      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashed });
  
      res.status(201).json({ message: 'Đăng ký thành công', userId: newUser._id });
    } catch (err) {
      res.status(500).json({ message: 'Đăng ký thất bại', error: err.message });
    }
  };

  const login = async (req, res) => {
    try {
      const { email, password } = req.body
  
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: 'Sai email hoặc mật khẩu' })
      }
  
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: 'Sai email hoặc mật khẩu' })
      }
  
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '3d' }
      )
  
      const { password: pw, ...userData } = user._doc
      res.status(200).json({ message: 'Đăng nhập thành công', token, user: userData })
    } catch (err) {
      res.status(500).json({ message: 'Đăng nhập thất bại', error: err.message })
    }
  }

module.exports = { register, login };
