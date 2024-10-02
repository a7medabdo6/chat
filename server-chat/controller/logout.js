const cookie = require('cookie'); // استيراد مكتبة الكوكيز

async function logoutUser(request, response) {
    response.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0), // تعيين تاريخ انتهاء الصلاحية إلى الماضي
        sameSite: 'strict',
        path: '/'
    }));

    return response.status(200).json({
        message: "Logout successful",
        success: true
    });
}

module.exports = logoutUser;
