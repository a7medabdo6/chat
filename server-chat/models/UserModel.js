const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "provide username"],
        unique: true // Ensure that the username is unique
    },
    email: {
        type: String,
        required: [true, "provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "provide password"]
    },
    profile_pic: {
        type: String,
        default: ""
    },
    userviews: {
        type: Number,
        default: 0
    },
    usermessages: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['online', 'busy', 'away', 'offline'], // Define the possible statuses
        default: 'offline' // Set the default status to offline
    },
    statusMessage: {
        type: String,
        default: "" // Default message can be an empty string or any other default message
    },
    country: {
        type: String,
        default: "" // Default can be an empty string or any specific default country
    },
    birthday: {
        type: Date // Store birthday as a Date type
    },
    blockList: {
        type: [String], // Array of strings to hold blocked usernames or user IDs
        default: [] // Default to an empty array
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'], // Define possible gender values
        default: 'other' // Set a default gender value
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // يشير إلى مستندات المستخدمين (الأصدقاء)
    }],
    friendRequestsSent: {
        type: [String], // Array of user IDs to whom requests were sent
        default: []
    },
    friendRequestsReceived: {
        type: [String], // Array of user IDs from whom requests were received
        default: []
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
