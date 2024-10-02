const express = require('express')
const registerUser = require('../controller/registerUser')
const loginUser = require('../controller/loginUser')
const userDetails = require('../controller/getUserDetails')
const logoutUser = require('../controller/logout')
const updateUserDetails = require('../controller/updateUserDetails')
const searchUser = require('../controller/searchUser')
const verifyToken = require('../Middleware/verifyToken')
const updatePassword = require('../controller/updatePassword')
const sendrequest = require('../controller/sendFriendRequest')
const rejectrequest = require('../controller/rejectFriendRequest')
const acceptrequest = require('../controller/acceptFriendRequest')


const router = express.Router()

//create user api
router.post('/register',registerUser)
//check user email
// //check user password
router.post('/login',loginUser)
// //login user details
router.post('/user-details',userDetails)
// //logout user
router.get('/logoutUser',logoutUser)
// //update user details
router.post('/update-user',updateUserDetails)
router.post('/update-password',updatePassword)
router.post('/friends-sendrequest',sendrequest)
router.post('/friends-acceptrequest',acceptrequest)
router.post('/friends-rejectrequest',rejectrequest)
// router.delete('/conversations/:conversationId', deleteConversation);

// //search user
router.post("/search-user",searchUser)
router.get('/protected', verifyToken, (req, res) => {
    res.json({
        message: "This is a protected route",
        user: req.user // Contains user info from token
    });
});



module.exports = router