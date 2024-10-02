const UserModel = require("../models/UserModel");
const jwt = require('jsonwebtoken');

async function getUserDetails(request, response) {
    try {
        // الحصول على التوكن من الجسم (body)
        const token = request.body.token;

        // التحقق من وجود التوكن
        if (!token) {
            return response.status(401).json({
                message: "Unauthorized: No token provided",
                error: true
            });
        }

        // التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // العثور على المستخدم مع تفاصيل الأصدقاء باستخدام populate
        const user = await UserModel.findById(userId)
            .select('-password') // لا نعيد كلمة المرور
            .populate({
                path: 'friends', 
                select: 'username email profile_pic status' // جلب حقول محددة فقط لكل صديق
            });

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true
            });
        }

        // إرجاع تفاصيل المستخدم مع الأصدقاء
        return response.status(200).json({
            message: "User details retrieved successfully",
            data: user,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = getUserDetails;
