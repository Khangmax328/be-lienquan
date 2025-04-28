const dotenv = require('dotenv');
dotenv.config();  // Đọc các giá trị từ file .env
require('./src/config/db');  // Kết nối MongoDB
require('./src/config/db')();
const express = require('express');
const cors = require('cors');  // Import cors
const app = express();
const PORT = process.env.PORT || 5000;

// Sử dụng CORS cho toàn bộ ứng dụng
// app.use(cors());  // Mở cho tất cả các domain (có thể cấu hình chi tiết nếu cần)
const allowedOrigins = [
  "http://shopkhanglienquan.com'",
  "https://fe-lienquan.onrender.com"
];
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
// Cấu hình middleware
app.use(express.json());  // Để xử lý các request body kiểu JSON

// Các route khác
require('./src/routes')(app);  // Đảm bảo tất cả route được định nghĩa

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
