const UserAdminRoutes = require('./userAdminRoutes')
const AuthRouter = require('./authRoutes')
const AccountRouter = require('./accountRoutes') // CRUD acc Liên Quân sau này
const ProfileRouter = require('./profileRoutes')
const UserRoutes = require('./userRoutes')
const CategoryRouter = require('./categoryRoutes')
const OrderRoutes = require('./orderRoutes')
const uploadRoutes = require('./uploadRoutes')
const adminStatsRoutes = require('./adminStatsRoutes')
const BalanceHistoryRouter = require('./balanceHistoryRoutes')
const PaymentInfoRoutes = require('./paymentInfoRoutes')

const routes = (app) => {
  app.use('/api/admin/users', UserAdminRoutes)
  app.use('/api/auth', AuthRouter)
  app.use('/api/accounts', AccountRouter)
  app.use('/api', ProfileRouter)
  app.use('/api/user', UserRoutes)
  app.use('/api/categories', CategoryRouter)
  app.use('/api/orders', OrderRoutes)
  app.use('/api/upload', uploadRoutes)
  app.use('/api/admin', adminStatsRoutes)
  app.use('/api/balance-history', BalanceHistoryRouter)
  app.use('/api/payment-info', PaymentInfoRoutes)


}

module.exports = routes
