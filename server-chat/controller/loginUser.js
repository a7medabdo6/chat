const UserModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function loginUser(request, response) {
    try {
        const { username, password } = request.body;

        // التحقق من وجود المستخدم
        const user = await UserModel.findOne({ username });
        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true
            });
        }

        // التحقق من صحة كلمة المرور
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return response.status(400).json({
                message: "Invalid credentials",
                error: true
            });
        }

        // تحقق من وجود JWT_SECRET
        if (!process.env.JWT_SECRET) {
            return response.status(500).json({
                message: "JWT_SECRET is not defined",
                error: true
            });
        }

        // إنشاء توكن JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // إرسال التوكن كجزء من الاستجابة
        return response.status(200).json({
            message: "Login successful",
            token: token, // إعادة التوكن في الاستجابة
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = loginUser;
