const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text : {
        type : String,
        default : ""
    },
    imageUrl : {
        type : String,
        default : ""
    },
    videoUrl : {
        type : String,
        default : ""
    },
    seen : {
        type : Boolean,
        default : false
    },
    msgByUserId : {
        type : mongoose.Schema.ObjectId,
        // required : true,
        ref : 'User'
    },
    replayMessageId: {  // الحقل الجديد للرسالة التي يتم الرد عليها
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
        default: null
    },
    reaction: {
        userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
        reaction: { type: String, default: "" } // رمز التفاعل (مثل 👍، ❤️)
    },
    serverMessage: { // إضافة الحقل الجديد
        type: Boolean,
        default: false
    }
},{
    timestamps : true
})

const conversationSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },
    receiver : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User'
    },
    messages : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Message'
        }
    ]
},{
    timestamps : true
})

const MessageModel = mongoose.model('Message',messageSchema)
const ConversationModel = mongoose.model('Conversation',conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}