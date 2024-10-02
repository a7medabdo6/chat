const UserModel = require("../models/UserModel");
const jwt = require('jsonwebtoken');

async function sendFriendRequest(request, response) {
    try {
        const { fromUserId, toUserId } = request.body; // Extracting user IDs from the request body

        // Find users in the database
        const fromUser = await UserModel.findById(fromUserId);
        const toUser = await UserModel.findById(toUserId);

        if (!fromUser || !toUser) {
            return response.status(404).json({
                message: 'User not found',
                error: true
            });
        }

        // Check if request already sent or users are already friends
        if (toUser.friends.includes(fromUserId) || toUser.friendRequestsReceived.includes(fromUserId)) {
            return response.status(400).json({
                message: 'Friend request already sent or user already in friends list',
                error: true
            });
        }

        // Add to friendRequestsSent and friendRequestsReceived
        fromUser.friendRequestsSent.push(toUserId);
        toUser.friendRequestsReceived.push(fromUserId);

        // Save both users to update the changes
        await fromUser.save();
        await toUser.save();

        return response.status(200).json({
            message: 'Friend request sent successfully',
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || 'Internal server error',
            error: true
        });
    }
}

module.exports = sendFriendRequest;
