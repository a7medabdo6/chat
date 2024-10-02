const express = require('express');
const { ConversationModel } = require('./path/to/your/models'); // Adjust the path accordingly

const router = express.Router();

// Function to delete a conversation
async function deleteConversation(req, res) {
    const { conversationId } = req.params; // Assuming you're passing the conversation ID in the URL

    try {
        // Find and delete the conversation
        const deletedConversation = await ConversationModel.findByIdAndDelete(conversationId);
        
        // Check if the conversation existed
        if (!deletedConversation) {
            return res.status(404).json({
                message: "Conversation not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Conversation deleted successfully",
            success: true
        });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the conversation",
            success: false,
            error: error.message // Optional: you can send the error message for debugging
        });
    }
}

// Define the route to delete a conversation

module.exports = router;
