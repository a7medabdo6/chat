const express = require('express')
const { Server } = require('socket.io')
const http = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')

const app = express()

/***socket connection */
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})

/***
 * socket running at http://localhost:8080/
 */

//online user
const onlineUser = new Set()

io.on('connection', async (socket) => {
    console.log("connect User ", socket.id)

    const token = socket.handshake.auth.token

    // //current user details 
    const user = await getUserDetailsFromToken(token._j)
    if (!user || !user._id) {
        console.error('User not found or invalid token');
        socket.disconnect(); // فصل الاتصال إذا لم يكن هناك مستخدم
        return; // إيقاف العملية هنا
    }



    // إنشاء غرفة
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    io.emit('onlineUser', Array.from(onlineUser));
    console.log(onlineUser, '77777777'); // تأكد من التحديث

    socket.on('message-page', async (userId) => {
        console.log('userId', userId)
        const userDetails = await UserModel.findById(userId).select("-password")

        const payload = {
            _id: userDetails?._id,
            username: userDetails?.username,
            email: userDetails?.email,
            profile_pic: userDetails?.profile_pic,
            online: onlineUser.has(userId)
        }

        socket.emit('message-user', payload)


        //get previous message
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: userId },
                { sender: userId, receiver: user?._id }
            ]
        }).populate({
            path: 'messages',
            populate: {
                path: 'replayMessageId', // جلب نص الرسالة الأصلية
                select: 'text'
            }
        }).sort({ updatedAt: -1 })

        socket.emit('message', getConversationMessage?.messages || [])
    })


    // //new message
    socket.on('new message', async (data) => {
        console.log(data);


        //check conversation is available both user

        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        })

        //if conversation is not available
        if (!conversation) {
            const createConversation = await ConversationModel({
                sender: data?.sender,
                receiver: data?.receiver
            })
            conversation = await createConversation.save()
        }

        const message = new MessageModel({
            text: data?.text,
            imageUrl: data?.imageUrl,
            //   videoUrl : data.videoUrl,
            msgByUserId: data?.msgByUserId,
            replayMessageId: data?.replayMessageId || null // إضافة replayMessageId إذا كان موجوداً

        })

        const saveMessage = await message.save()
        console.log(saveMessage, 'saveMessage');

        const updateConversation = await ConversationModel.updateOne({ _id: conversation?._id }, {
            "$push": { messages: saveMessage?._id }
        })

        console.log(updateConversation, 'updateConversation');


        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        }).populate({
            path: 'messages',
            populate: {
                path: 'replayMessageId', // جلب نص الرسالة الأصلية
                select: 'text'
            }
        }).sort({ updatedAt: -1 })




        if (getConversationMessage && getConversationMessage.messages.length > 0) {

            io.to(data?.sender?.toString()).emit('message', getConversationMessage.messages);
            io.to(data?.receiver?.toString()).emit('message', getConversationMessage.messages);

        } else {
            console.log('No messages found in conversation');
        }


        // //send conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation', conversationSender)
        io.to(data?.receiver).emit('conversation', conversationReceiver)
    })


    // //sidebar
    socket.on('sidebar', async (currentUserId) => {
        console.log("current user", currentUserId)

        const conversation = await getConversation(currentUserId)

        socket.emit('conversation', conversation)

    })

    socket.on('seen', async (msgByUserId) => {

        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user?._id }
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages = await MessageModel.updateMany(
            { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
            { "$set": { seen: true } }
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation', conversationSender)
        io.to(msgByUserId).emit('conversation', conversationReceiver)
    })



    socket.on('message-reaction', async (data) => {
        const { messageId, userId, reaction } = data;

        try {
            // البحث عن الرسالة وتحديث التفاعل
            const updatedMessage = await MessageModel.findByIdAndUpdate(
                messageId,
                {
                    reaction: {
                        userId: userId,
                        reaction: reaction
                    }
                },
                { new: true } // إرجاع الرسالة بعد التحديث
            ).populate('msgByUserId', 'username');

            // إذا تم تحديث الرسالة
            if (updatedMessage) {
                // إرسال الرسالة المحدثة إلى المرسل والمستقبل
                io.to(updatedMessage?.msgByUserId?._id.toString()).emit('message-reaction-updated', updatedMessage);

                // تحديث المحادثة
                const conversation = await ConversationModel.findOne({
                    messages: messageId
                }).populate({
                    path: 'messages',
                    populate: {
                        path: 'replayMessageId',
                        select: 'text'
                    }
                }).sort({ updatedAt: -1 });

                if (conversation) {
                    // إرسال المحادثة المحدثة إلى المرسل والمستقبل
                    io.to(conversation.sender.toString()).emit('conversation-updated', conversation);
                    io.to(conversation.receiver.toString()).emit('conversation-updated', conversation);
                }
            }
        } catch (error) {
            console.error('Error updating reaction:', error);
        }
    });

 // Add this inside the io.on('connection', ...) function

 socket.on('delete message', async (messageId) => {
    try {
        // العثور على الرسالة بواسطة ID
        const messageToDelete = await MessageModel.findById(messageId);

        if (!messageToDelete) {
            socket.emit('delete message response', { success: false, message: 'Message not found' });
            return;
        }

        // التأكد من أن المستخدم الحالي هو من أرسل الرسالة
        if (messageToDelete.msgByUserId.toString() !== user._id.toString()) {
            socket.emit('delete message response', { success: false, message: 'You can only delete your own messages' });
            return;
        }

        // تحديث محتوى الرسالة إلى "محذوف"
        const deletedMessage = await MessageModel.findByIdAndUpdate(
            messageId,
            { text: 'Message Deleted', deleted: true }, // تحديث المحتوى وإضافة علامة "محذوف"
            { new: true }
        );

        // العثور على المحادثة المرتبطة بهذه الرسالة
        const conversation = await ConversationModel.findOne({ messages: messageId }).populate({
            path: 'messages',
            populate: {
                path: 'replayMessageId',
                select: 'text'
            }
        }).sort({ updatedAt: -1 });

        if (conversation) {
            // إرسال المحادثة المحدثة إلى المرسل والمستقبل
            io.to(conversation.sender.toString()).emit('conversation-updated', conversation);
            io.to(conversation.receiver.toString()).emit('conversation-updated', conversation);

            // تحديث الرسائل في الغرفة
            io.to(conversation.sender.toString()).emit('message', conversation.messages);
            io.to(conversation.receiver.toString()).emit('message', conversation.messages);
        }

        // إرسال استجابة النجاح للعميل
        socket.emit('delete message response', { success: true, messageId });

    } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('delete message response', { success: false, message: 'Error deleting message' });
    }
});





    socket.on('logout', () => {
        const userId = user?._id?.toString();

        if (userId) {
            io.emit('user-offline', { userId }); // إعلام بأن المستخدم أصبح غير متصل
            onlineUser.delete(userId); // إزالة المستخدم من قائمة المتصلين
            console.log(onlineUser, 'onlineUser after logout'); // تأكد من التحديث
            io.emit('onlineUser', Array.from(onlineUser));

            socket.disconnect(); // فصل الاتصال
            console.log(`User logged out and disconnected: ${userId}`);
        }
    });

    // عند فصل الاتصال
    socket.on('disconnect', () => {
        const userId = user?._id?.toString();
        if (userId) {
            onlineUser.delete(userId); // إزالة المستخدم
            io.emit('onlineUser', Array.from(onlineUser));

            io.emit('user-offline', { userId });
            console.log(onlineUser, 'onlineUser after disconnect'); // تأكد من التحديث
            console.log(`disconnect user: ${userId}`);
        }
    });

})

module.exports = {
    app,
    server
}
