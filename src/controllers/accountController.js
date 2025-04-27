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


// 🆕 API chỉ dành cho Admin
const getAllAccountsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20000, sortPrice } = req.query;

    const query = {}; // không lọc isSold

    const sortQuery = {};
    if (sortPrice === 'asc') sortQuery.price = 1;
    else if (sortPrice === 'desc') sortQuery.price = -1;
    if (req.query.username) {
      query.username = { $regex: req.query.username, $options: 'i' }; // không phân biệt hoa thường
    }
    const total = await Account.countDocuments(query);
    const accounts = await Account.find(query)
      .populate('type', 'name')
      .select('name type price champions skins gems rank username password authCode isSold createdAt updatedAt image')
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

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
  getAccountsExcludeLucky
} 
