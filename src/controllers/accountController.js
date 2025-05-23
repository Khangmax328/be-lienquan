// src/controllers/accountController.js
const Account = require('../models/AccountModel')
const { v2: cloudinary } = require('cloudinary')
const Category = require('../models/CategoryModel') // hoặc đúng path model bạn lưu

// Tạo mới một tài khoản
const createAccount = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Chỉ admin mới được tạo acc' })
    }

    const {
      name,
      type,
      price,
      champions,
      skins,
      gems,
      username,
      password,
      authCode,
      rank
    } = req.body

    // const accExist = await Account.findOne({ username })
    // if (accExist) {
    //   return res.status(400).json({ message: 'Tài khoản game này đã tồn tại' })
    // }

    // Upload ảnh đại diện (1 ảnh)
    let image = null
    if (req.files && req.files['image']) {
      const file = req.files['image'][0]
      image = {
        url: file.path,
        public_id: file.filename
      }
    }

    // Upload nhiều ảnh (gallery)
    const images = req.files?.images?.map(file => ({
      url: file.path,
      public_id: file.filename
    })) || []

    const newAccount = new Account({
      name,
      type,
      price,
      champions,
      skins,
      gems,
      username,
      password,
      authCode,
      rank,
      image,
      images
    })

    await newAccount.save()

    res.status(201).json({ message: 'Tạo acc thành công', account: newAccount })
  } catch (error) {
    console.error('Lỗi khi tạo acc:', error)
    res.status(500).json({ message: 'Lỗi tạo acc', error: error.message })
  }
}


const getAllAccounts = async (req, res) => {
  try {
    const isAdmin = req.user?.isAdmin;
    const { page = 1, limit = 20000, minPrice, maxPrice, type, rank, sortPrice } = req.query;

    const query = { isSold: false };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (type) query.type = type;

    if (rank && rank !== 'Tất cả rank') {
      query.rank = decodeURIComponent(rank).trim();
    }

    const sortQuery = {};
    if (sortPrice === 'asc') sortQuery.price = 1;
    else if (sortPrice === 'desc') sortQuery.price = -1;

    const total = await Account.countDocuments(query);
    const accounts = await Account.find(query)
      .populate('type', 'name')
      // .select(isAdmin ? '-__v' : 'name type price champions skins gems rank isSold createdAt updatedAt image')
      .select(
        isAdmin
          ? 'name type price champions skins gems rank username password authCode isSold createdAt updatedAt image'
          : 'name type price champions skins gems rank isSold createdAt updatedAt image'
      )

      .sort(sortQuery) // 🆕
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      accounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách acc', error: error.message });
  }
};

const getAllAccountsLanding = async (req, res) => {
  try {
    const { type, rank } = req.query;  // Chỉ lấy các query cần thiết

    const query = { isSold: false };  // Điều kiện mặc định là tài khoản chưa bán

    // Bộ lọc theo loại tài khoản
    if (type) query.type = type;

    // Bộ lọc theo rank
    if (rank && rank !== 'Tất cả rank') {
      query.rank = decodeURIComponent(rank).trim();
    }

    // Lấy tổng số tài khoản
    const total = await Account.countDocuments(query);

    // Lấy danh sách tài khoản chỉ với các trường '_id' và 'type'
    const accounts = await Account.find(query)
      .select('_id type')  // Chỉ lấy các trường '_id' và 'type'
      .lean();  // Sử dụng lean() để trả về dữ liệu đơn giản, tránh overhead từ các mô hình mongoose

    // Trả về kết quả
    res.status(200).json({
      total,
      accounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách acc', error: error.message });
  }
};


const getAllstatus = async (req, res) => {
  try {
    const { type, rank } = req.query;

    const query = {};

    if (type) query.type = type;
    if (rank && rank !== 'Tất cả rank') {
      query.rank = decodeURIComponent(rank).trim();
    }
    const total = await Account.countDocuments(query);
    const soldTotal = await Account.countDocuments({ ...query, isSold: true });
    const unsoldTotal = await Account.countDocuments({ ...query, isSold: false });

    res.status(200).json({
      total,         // Tổng số tài khoản
      soldTotal,     // Tổng số tài khoản đã bán
      unsoldTotal,   // Tổng số tài khoản chưa bán
      // accounts       
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách acc', error: error.message });
  }
};


const getTotalByCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    const promises = categories.map(category =>
      Account.countDocuments({
        type: category._id,
        isSold: false
      }).then(count => ({ name: category.name, count }))
    );
    const results = await Promise.all(promises);
    const result = results.reduce((acc, { name, count }) => {
      acc[name] = count;
      return acc;
    }, {});
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khi tính toán tổng số tài khoản:', error);
    res.status(500).json({ message: 'Lỗi tính toán tổng số tài khoản', error: error.message });
  }
};


const getAccountsExcludeLucky = async (req, res) => {
  try {
    const { page = 1, limit = 50, minPrice, maxPrice, rank, sortPrice } = req.query;

    // 1. Lấy danh sách category "Thử Vận May"
    const luckyCategories = await Category.find({
      name: { $regex: /thử vận may/i },
    });

    const excludedCategoryIds = luckyCategories.map(cat => cat._id.toString());

    // 2. Tạo query lọc
    const query = {
      isSold: false,
      type: { $nin: excludedCategoryIds }, // Loại bỏ các loại thử vận may
    };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rank && rank !== 'Tất cả rank') {
      query.rank = decodeURIComponent(rank).trim();
    }

    const sortQuery = {};
    if (sortPrice === 'asc') sortQuery.price = 1;
    else if (sortPrice === 'desc') sortQuery.price = -1;

    const total = await Account.countDocuments(query);
    const accounts = await Account.find(query)
      .populate('type', 'name')
      .select('name type price champions skins gems rank image isSold')
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      accounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy acc không thuộc thử vận may', error: error.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const acc = await Account.findById(req.params.id).populate('type', 'name')
    if (!acc) return res.status(404).json({ message: 'Không tìm thấy acc' })

    const isAdmin = req.user?.isAdmin
    if (!isAdmin) {
      const { username, password, authCode, ...publicData } = acc._doc
      return res.status(200).json(publicData)
    }

    res.status(200).json(acc)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy acc', error: err.message })
  }
}

const updateAccount = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật acc' })
    }

    const updated = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy acc' })
    res.status(200).json({ message: 'Cập nhật acc thành công', account: updated })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật acc', error: err.message })
  }
}

const deleteAccount = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xoá acc' })
    }

    const acc = await Account.findById(req.params.id)
    if (!acc) return res.status(404).json({ message: 'Không tìm thấy acc' })

    if (acc.image?.public_id) {
      await cloudinary.uploader.destroy(acc.image.public_id)
    }
    for (const img of acc.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id)
      }
    }

    await acc.deleteOne()

    res.status(200).json({ message: 'Đã xoá acc thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá acc', error: err.message })
  }
}

const getAllAccountsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortPrice, soldStatus, username, sortBy } = req.query;

    const query = {};

    if (soldStatus) {
      if (soldStatus === 'sold') query.isSold = true;
      else if (soldStatus === 'unsold') query.isSold = false;
    }

    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }

    // Mặc định sắp xếp theo giá nếu có, hoặc thời gian mua gần nhất (paidAt)
    // sortBy có thể là 'price' hoặc 'lastOrderTime'
    let sortQuery = {};
    if (sortBy === 'lastOrderTime') {
      // Chúng ta sẽ sort sau khi thêm lastOrderTime trong pipeline
    } else {
      if (sortPrice === 'asc') sortQuery.price = 1;
      else if (sortPrice === 'desc') sortQuery.price = -1;
    }

    const total = await Account.countDocuments(query);

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'account',
          as: 'orders'
        }
      },
      // Tạo trường lastOrderTime: lấy thời gian paidAt của đơn hàng mới nhất
      {
        $addFields: {
          lastOrderTime: {
            $cond: [
              { $gt: [{ $size: "$orders" }, 0] },
              { $max: "$orders.paidAt" },
              null
            ]
          }
        }
      },
    ];

    // Thêm sắp xếp theo yêu cầu
    if (sortBy === 'lastOrderTime') {
      pipeline.push({ $sort: { lastOrderTime: -1 } });  // Mới nhất trước
    } else if (Object.keys(sortQuery).length > 0) {
      pipeline.push({ $sort: sortQuery });
    }

    // Phân trang
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
    );

    // Lấy thông tin người mua
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'orders.user',
          foreignField: '_id',
          as: 'buyerUsers'
        }
      },
      {
        $addFields: {
          buyerUsername: {
            $arrayElemAt: [
              {
                $map: {
                  input: '$buyerUsers',
                  as: 'user',
                  in: '$$user.email'
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          buyerUsers: 0
        }
      }
    );

    const accounts = await Account.aggregate(pipeline);

    res.status(200).json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      accounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách acc (admin)', error: error.message });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  getAllAccountsForAdmin,
  getAccountsExcludeLucky, getAllAccountsLanding, getAllstatus, getTotalByCategory
} 
