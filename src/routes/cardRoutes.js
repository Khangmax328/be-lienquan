const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Người dùng nạp thẻ
router.post('/cards', verifyToken, cardController.createCard);

// Người dùng lấy thẻ của mình
router.get('/cards/user', verifyToken, cardController.getUserCards);

// Admin lấy tất cả thẻ
router.get('/cards', verifyToken, verifyAdmin, cardController.getAllCards);

// Admin lấy chi tiết thẻ kèm user
router.get('/cards/details', verifyToken, verifyAdmin, cardController.getAllCardDetails);

// Admin cập nhật trạng thái thẻ
router.put('/cards/:cardId/status', verifyToken, verifyAdmin, cardController.updateCardStatus);
router.delete('/cards/:cardId', verifyToken, verifyAdmin, cardController.deleteCard);



module.exports = router;
