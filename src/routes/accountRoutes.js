const express = require('express')
const uploadCloud = require('../middleware/uploadCloud')
const router = express.Router()
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware')
const {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  getAllAccountsForAdmin,
  getAccountsExcludeLucky
} = require('../controllers/accountController')

// [POST] Tạo acc – chỉ admin
// router.post('/',verifyToken, verifyAdmin, uploadCloud.array('images', 50), createAccount)
router.post(
  '/',
  verifyToken,
  verifyAdmin,
  uploadCloud.fields([
    { name: 'image', maxCount: 1 },        // Ảnh đại diện
    { name: 'images', maxCount: 50 }       // Nhiều ảnh chi tiết
  ]),
  createAccount
)
router.get('/admin', verifyToken, verifyAdmin, getAllAccountsForAdmin);
router.get('/exclude-lucky', getAccountsExcludeLucky);

router.get('/', getAllAccounts)
router.get('/:id', getAccountById)
router.put('/:id',verifyToken, verifyAdmin, updateAccount)
router.delete('/:id',verifyToken, verifyAdmin, deleteAccount)

module.exports = router
