const jwt = require('jsonwebtoken');

const JWT_SECRET = 'ASKDGJSLDJGSLA;KDJIUOEWUTPIOUASKLDGJ;SLDKAJG'; // استخدم نفس السر كما في تسجيل الدخول

function verifyToken(req, res, next) {
    const token = req.body.token; // احصل على التوكن من الجسم

    if (!token) {
        return res.status(403).json({
            message: "Token is required",
            error: true
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Invalid token",
                error: true
            });
        }

        req.user = decoded; // احفظ معلومات المستخدم المستخرجة في كائن الطلب
        next(); // تابع إلى الميدلوير التالي
    });
}

module.exports = verifyToken;
