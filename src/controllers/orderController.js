// src/controllers/orderController.js
const Order = require('../models/OrderModel')
const Account = require('../models/AccountModel')
const User = require('../models/UserModel')
const BalanceHistory = require('../models/BalanceHistoryModel')

// Tạo đơn hàng (thanh toán trực tiếp khi đủ tiền)
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id
    const { accountId } = req.body

    const account = await Account.findById(accountId)
    if (!account) return res.status(404).json({ message: 'Acc không tồn tại' })
    if (account.isSold) return res.status(400).json({ message: 'Acc đã bán rồi' })

    const user = await User.findById(userId)
    if (user.balance < account.price) {
      return res.status(400).json({ message: 'Số dư không đủ để mua acc' })
    }

    // ✅ Trừ tiền
    user.balance -= account.price
    await user.save()

    // ✅ Đánh dấu acc đã bán
    account.isSold = true
    await account.save()

    // ✅ Tạo đơn hàng
    const newOrder = await Order.create({
      user: userId,
      account: accountId,
      isPaid: true,
      paidAt: new Date()
    })
    res.status(201).json({ message: 'Đặt hàng thành công', order: newOrder, balance: user.balance })
  } catch (err) {
    console.error('🔥 Lỗi:', err)
    res.status(500).json({ message: 'Lỗi tạo đơn hàng', error: err.message })
  }
}



// Lấy danh sách đơn hàng của user
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({ path: 'account', populate: { path: 'type', select: 'name' } })
    res.status(200).json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy đơn hàng', error: err.message })
  }
}

// Lấy chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('account', '-__v -createdAt -updatedAt')
      .populate('user', 'username email')

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

    // Chỉ người mua hoặc admin được xem
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' })
    }

    res.status(200).json({
      message: 'Lấy thông tin đơn hàng thành công',
      order,
    })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng', error: err.message })
  }
}

// Xóa đơn hàng (chỉ người mua hoặc admin)
const deleteMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đơn hàng này' })
    }

    await order.deleteOne()

    res.status(200).json({ message: 'Đã xóa đơn hàng thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa đơn hàng', error: err.message })
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  deleteMyOrder
}
