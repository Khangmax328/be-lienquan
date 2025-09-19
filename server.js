const dotenv = require('dotenv');
dotenv.config();
require('./src/config/db')();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware redirect domain gốc sang www
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host === 'shopkhanglienquan.com') {
    return res.redirect(301, 'https://www.shopkhanglienquan.com' + req.originalUrl);
  }
  next();
});

// CORS (cho phép mọi origin)
app.use(cors({
  origin: "*", // chấp nhận tất cả domain (Heroku, Vercel, Render, localhost, custom domain...)
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use(express.json());

// Các route khác
require('./src/routes')(app);

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
