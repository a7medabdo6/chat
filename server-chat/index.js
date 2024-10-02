const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { app, server } = require('./socket/index')


// إعداد CORS للسماح بالطلبات من أي أصل
app.use(cors({
    origin: function (origin, callback) {
      if (origin) {
        callback(null, origin); // السماح لجميع النطاقات بإرجاع قيمة الـ Origin الخاصة بهم
      } else {
        callback(null, '*'); // التعامل مع الطلبات بدون origin (مثل Postman)
      }
    },
    credentials: true, // السماح بإرسال ملفات تعريف الارتباط
  }));
  
app.use(express.json());
app.use(cookiesParser());

const PORT = process.env.PORT || 8080;

app.get('/', (request, response) => {
    response.json({
        message: "Server running at " + PORT
    });
});

// نقاط النهاية الخاصة بالـ API
app.use('/api', router);

connectDB().then(() => {
  server.listen(PORT, () => {
        console.log("Server running at " + PORT);
    });
});
 