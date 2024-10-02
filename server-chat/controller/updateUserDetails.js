const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");

async function updateUserDetails(request, response) {
    try {
        // الحصول على التوكن من الجسم (body)
        const token = request.body.token || "";

        // التحقق من التوكن والحصول على تفاصيل المستخدم
        const user = await getUserDetailsFromToken(token);

        // استخراج جميع الحقول المراد تحديثها من الجسم (body)
        const updatedFields = request.body; // يمكن تعديل أي شيء من الجسم

        // تحديث المستخدم في قاعدة البيانات بناءً على _id
        const updateUser = await UserModel.updateOne({ _id: user._id }, updatedFields);

        // إرجاع المعلومات المحدثة للمستخدم
        const userInformation = await UserModel.findById(user._id);

        return response.json({
            message: "User updated successfully",
            data: userInformation,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = updateUserDetails;
