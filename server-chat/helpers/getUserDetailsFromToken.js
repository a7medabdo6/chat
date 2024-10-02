const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    try {
        // التحقق من وجود التوكن
        if (!token) {
            return {
                message: "Session expired",
                logout: true
            };
        }

        // التحقق من صحة التوكن
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        // العثور على المستخدم بناءً على _id
        const user = await UserModel.findById(decoded.id).select('-password');

        // إذا لم يتم العثور على المستخدم
        if (!user) {
            return {
                message: "User not found",
                logout: true
            };
        }

        return user;
    } catch (error) {
        // معالجة الأخطاء المحتملة
        return {
            message: error.message || "Invalid token",
            logout: true
        };
    }
};

module.exports = getUserDetailsFromToken;
