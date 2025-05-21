const Card = require('../models/CardModel');
const User = require('../models/UserModel');

// Người dùng nạp thẻ
const createCard = async (req, res) => {
  try {
    const { provider, amount, cardCode, serial } = req.body;
    const userEmail = req.user.email; // Lấy email từ token hoặc session

    if (!provider || !amount || !cardCode || !serial) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin thẻ' });
    }

    const newCard = new Card({
      provider,
      amount,
      cardCode,
      serial,
      userEmail,   // Lưu email ở đây
      status: 'pending',
    });

    await newCard.save();

    return res.status(201).json({ message: 'Nạp thẻ thành công, trạng thái đang chờ xử lý', card: newCard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server khi nạp thẻ' });
  }
};

// Người dùng lấy tất cả thẻ của mình, phân trang
const getUserCards = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { page = 1, limit = 20 } = req.query;

    const cards = await Card.find({ userEmail })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Card.countDocuments({ userEmail });

    return res.status(200).json({
      cards,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi lấy danh sách thẻ của user', error: error.message });
  }
};

// Admin lấy tất cả thẻ của tất cả user, phân trang
const getAllCards = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const cards = await Card.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Card.countDocuments();

    return res.status(200).json({
      cards,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi lấy danh sách thẻ', error: error.message });
  }
};

// Admin lấy chi tiết thẻ kèm thông tin người dùng (join qua email)
const getAllCardDetails = async (req, res) => {
  try {
    const cards = await Card.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userEmail',
          foreignField: 'email',
          as: 'userInfo',
          pipeline: [
            { $project: { email: 1, balance: 1, _id: 0 } } // chỉ lấy email và balance
          ]
        },
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json(cards);
  } catch (error) {
    console.error("Error getAllCardDetails:", error);
    return res.status(500).json({ message: 'Lỗi lấy chi tiết thẻ', error: error.message });
  }
};


// Admin chỉnh sửa trạng thái thẻ
const updateCardStatus = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { status, balance } = req.body;

    if (!['pending', 'used', 'invalid'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Không tìm thấy thẻ' });
    }

    // Cập nhật trạng thái thẻ
    card.status = status;

    // Cập nhật balance nếu có, và update luôn User tương ứng
    if (balance !== undefined) {
      const user = await User.findOne({ email: card.userEmail });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy user tương ứng' });
      }
      user.balance = balance;
      await user.save();
    }

    await card.save();

    return res.json({ message: 'Cập nhật trạng thái thẻ và số dư thành công', card });
  } catch (error) {
    console.error("Error in updateCardStatus:", error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái thẻ' });
  }
};

// Admin xoá card theo ID
const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const deleted = await Card.findByIdAndDelete(cardId);

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy thẻ để xoá' });
    }

    return res.status(200).json({ message: 'Xoá thẻ thành công' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi xoá thẻ', error: error.message });
  }
};

module.exports = {
  createCard,
  getUserCards,
  getAllCards,
  getAllCardDetails,
  updateCardStatus,
  deleteCard
};
