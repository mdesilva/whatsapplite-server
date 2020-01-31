var io = require('socket.io')(3010); //listen on port 3010 for socket connections
const ConversationController = new (require("./Controllers/ConversationController"))(); 
const UserController = new (require("./Controllers/UserController"))();

console.log("Socket server running on port 3010");

async function newMessage(socket, data) {
    //Verify that sender's token is still valid, and then send message
    const senderId = await UserController.verifyTokenAndReturnUserId(data.senderToken);
    if (!senderId) {
        io.to(socket.id).emit('InvalidToken');
        return;
    }
    const receiverSocketId = await UserController.getSocketId(data.receiverId);
    if (receiverSocketId) { 
        console.log("Sending to " + receiverSocketId);
        io.to(receiverSocketId).emit('message', {sender: senderId, message: data.message});
    }
    //write message to disk 
    ConversationController.addNewMessage(senderId, data.receiverId, data.message);
}

io.on('connection', function(socket){
    /*
    Once a new connection is established, we need to get the socket id of that connection and record it for the user.
    */
   socket.on('newConnection', (data) => {
       UserController.setSocketId(data.token, socket.id);
       io.to(socket.id).emit('message', {message: "connected to server"});
   })

    /*
    Send a new message. Data payload will consist of the following:
    senderToken (token),
    receiverId (id),
    message
    */
    socket.on('newMessage', (data) => { 
        //lookup receiver's socket id and then send message to receiver
        console.log(data);
        newMessage(socket, data);
    })


})