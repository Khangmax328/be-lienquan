const Order = require('../models/OrderModel')
const Account = require('../models/AccountModel')
const User = require('../models/UserModel')
const BalanceHistory = require('../models/BalanceHistoryModel')

const getAdminOverview = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
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
          _id: null,
          total: { $sum: '$accountInfo.price' }
        }
      }
    ])

    const totalOrders = await Order.countDocuments()
    const totalAccountsSold = await Account.countDocuments({ isSold: true })
    const totalAccountsAvailable = await Account.countDocuments({ isSold: false })
    const totalUsers = await User.countDocuments()

    res.status(200).json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalAccountsSold,
      totalAccountsAvailable,
      totalUsers
    })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: err.message })
  }
}
const getTopRechargers = async (req, res) => {
    try {
      const topUsers = await BalanceHistory.aggregate([
        { $match: { action: 'Cộng' } }, // chỉ tính các giao dịch nạp tiền
        {
          $group: {
            _id: '$user',
            totalRecharged: { $sum: '$amount' }
          }
        },
        { $sort: { totalRecharged: -1 } },
        { $limit: 10 },
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
            _id: 0,
            username: '$userInfo.username',
            totalRecharged: 1
          }
        }
      ])
  
      res.status(200).json(topUsers)
    } catch (err) {
      res.status(500).json({ message: 'Lỗi lấy top người nạp tiền', error: err.message })
    }
  }
  const getTopBuyers = async (req, res) => {
    try {
      const topBuyers = await Order.aggregate([
        {
          $lookup: {
            from: 'accounts',
            localField: 'account',
            foreignField: '_id',
            as: 'accountData'
          }
        },
        { $unwind: '$accountData' },
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$accountData.price' }
          }
        },
        { $sort: { totalOrders: -1 } },
        { $limit: 10 },
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
            _id: 0,
            username: '$userInfo.username',
            totalSpent: 1
          }
        }
      ])
  
      res.status(200).json(topBuyers)
    } catch (err) {
      res.status(500).json({ message: 'Lỗi lấy top người mua', error: err.message })
    }
  }

module.exports = { getAdminOverview, getTopRechargers, getTopBuyers}
