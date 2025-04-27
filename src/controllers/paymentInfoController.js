const PaymentInfo = require('../models/PaymentInfoModel')
const { v2: cloudinary } = require('cloudinary')

// Tạo thông tin thanh toán mới
const createPaymentInfo = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: 'Chỉ admin mới được tạo thông tin' })

    const { accountNumber, bankName, fullName, transferNote } = req.body

    let qrImage = null
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path)
      qrImage = {
        url: result.secure_url,
        public_id: result.public_id
      }
    }

    const newInfo = new PaymentInfo({ accountNumber, bankName, fullName, transferNote, qrImage })
    await newInfo.save()

    res.status(201).json({ message: 'Tạo thông tin thành công', data: newInfo })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo thông tin', error: err.message })
  }
}

// Lấy tất cả thông tin
const getAllPaymentInfo = async (req, res) => {
  try {
    const list = await PaymentInfo.find().sort({ createdAt: -1 })
    res.status(200).json(list)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách', error: err.message })
  }
}

// Cập nhật thông tin
const updatePaymentInfo = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: 'Không có quyền' })

    const { accountNumber, bankName, fullName, transferNote } = req.body
    let qrImage = null

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path)
      qrImage = {
        url: result.secure_url,
        public_id: result.public_id
      }
    }

    const updated = await PaymentInfo.findByIdAndUpdate(
      req.params.id,
      { accountNumber, bankName, fullName, transferNote, ...(qrImage && { qrImage }) },
      { new: true }
    )

    if (!updated) return res.status(404).json({ message: 'Không tìm thấy thông tin' })
    res.status(200).json({ message: 'Cập nhật thành công', data: updated })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: err.message })
  }
}

// Xóa
const deletePaymentInfo = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: 'Không có quyền' })

    const info = await PaymentInfo.findById(req.params.id)
    if (!info) return res.status(404).json({ message: 'Không tìm thấy thông tin' })

    if (info.qrImage?.public_id) {
      await cloudinary.uploader.destroy(info.qrImage.public_id)
    }

    await info.deleteOne()
    res.status(200).json({ message: 'Đã xoá thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá', error: err.message })
  }
}

module.exports = {
  createPaymentInfo,
  getAllPaymentInfo,
  updatePaymentInfo,
  deletePaymentInfo
}
