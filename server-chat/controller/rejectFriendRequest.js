const UserModel = require("../models/UserModel");
const jwt = require('jsonwebtoken');

async function rejectFriendRequest(request, response) {
    try {
        const { userId, friendUserId } = request.body; // Extracting user IDs from the request body

        // Find users in the database
        const user = await UserModel.findById(userId);
        const friendUser = await UserModel.findById(friendUserId);

        if (!user || !friendUser) {
            return response.status(404).json({
                message: 'User not found',
                error: true
            });
        }

        // Check if a friend request exists
        if (!user.friendRequestsReceived.includes(friendUserId)) {
            return response.status(400).json({
                message: 'No friend request received from this user',
                error: true
            });
        }

        // Remove the friend request
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id !== friendUserId);
        friendUser.friendRequestsSent = friendUser.friendRequestsSent.filter(id => id !== userId);

        // Save both users to update the changes
        await user.save();
        await friendUser.save();

        return response.status(200).json({
            message: 'Friend request rejected successfully',
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || 'Internal server error',
            error: true
        });
    }
}

module.exports = rejectFriendRequest;
