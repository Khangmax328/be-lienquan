const Order = require('../models/OrderModel')
const User = require('../models/UserModel')

const getTopUsersByOrders = async (req, res) => {
  try {
    const topUsers = await Order.aggregate([
      {
        $lookup: {
          from: 'accounts',
          localField: 'account',
          foreignField: '_id',
          as: 'accountInfo'
        }
      },
      {
        $unwind: '$accountInfo'
      },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$accountInfo.price' }
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 0,
          userId: '$userInfo._id',
          username: '$userInfo.username',
          email: '$userInfo.email',
          totalOrders: 1,
          totalSpent: 1
        }
      }
    ])

    res.status(200).json(topUsers)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi thống kê top user', error: err.message })
  }
}

module.exports = {
  getTopUsersByOrders
}
