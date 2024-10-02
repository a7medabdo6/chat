const bcrypt = require('bcrypt');
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");

async function updatePassword(request, response) {
    try {
        // Get the token from the request body
        const token = request.body.token || "";

        // Validate and get user details from the token
        const user = await getUserDetailsFromToken(token);

        if (user.logout) {
            return response.status(401).json({
                message: "Unauthorized: Session expired",
                error: true
            });
        }

        // Extract new password from request body
        const { newPassword } = request.body;

        if (!newPassword) {
            return response.status(400).json({
                message: "New password is required",
                error: true
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await UserModel.updateOne({ _id: user._id }, { password: hashedPassword });

        // Respond with success message
        return response.status(200).json({
            message: "Password updated successfully",
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = updatePassword;
