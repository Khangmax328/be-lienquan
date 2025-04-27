const express = require('express')
const cors = require('cors')
const routes = require('./routes') // 👈
const balanceHistoryRoutes = require('./routes/balanceHistoryRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/balance-history', balanceHistoryRoutes)
routes(app) // 👈 gọi tất cả route tại đây


app.use('/api/payment-info', require('./routes/paymentInfoRoutes'))
app.use('/api/auth', authRoutes)
app.get('/', (req, res) => {
  res.send('🎮 Shop acc Liên Quân đang chạy...')
})

module.exports = app
