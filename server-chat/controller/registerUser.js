const UserModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');

async function registerUser(request, response) {
    try {
        const { username, email, password } = request.body;

        // Check for existing username
        const checkUsername = await UserModel.findOne({ username });
        if (checkUsername) {
            return response.status(400).json({
                message: "User already exists with this username",
                error: true,
            });
        }

        // Check for existing email
        const checkEmail = await UserModel.findOne({ email });
        if (checkEmail) {
            return response.status(400).json({
                message: "User already exists with this email",
                error: true,
            });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const payload = {
            username,
            email,
            password: hashPassword
        };

        const user = new UserModel(payload);
        const userSave = await user.save();

        return response.status(201).json({
            message: "User created successfully",
            data: userSave,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = registerUser;
