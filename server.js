const dotenv = require('dotenv');
dotenv.config();
require('./src/config/db')();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://fe-lienquan.vercel.app",
  "https://fe-lienquan.onrender.com", 
  "https://fe-lienquan-hpk6rzk9h-khangmax328s-projects.vercel.app",
  "https://www.shopkhanglienquan.com", 
  "https://shopkhanglienquan.com",
];

// Middleware redirect domain gốc sang www
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host === 'shopkhanglienquan.com') {
    return res.redirect(301, 'https://www.shopkhanglienquan.com' + req.originalUrl);
  }
  next();
});

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use(express.json());

// Các route khác
require('./src/routes')(app);

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
