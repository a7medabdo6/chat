const UserModel = require('../models/UserModel')

async function searchUser(request, response) {
    try {
        const { username } = request.body; // Extract username from the request body

        const query = new RegExp(username, "i"); // Create a case-insensitive regex pattern

        const user = await UserModel.find({ username: query }) // Search by username only
            .select("-password"); // Exclude password from the result

        if (user.length === 0) {
            return response.status(404).json({
                message: 'No user found with the given username',
                success: false
            });
        }

        return response.json({
            message: 'User found',
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

module.exports = searchUser;
