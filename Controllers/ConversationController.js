const Controller = require("./Controller");
const Conversation = require("../Models/Conversation");
const Message = require("../Models/Message");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const UserController = new (require("../Controllers/UserController"))();

class ConversationController extends Controller {


    determineReceiver(sender, receiver, userId) {
        if (String(sender) == userId) {
            return receiver;
        } else {
            return sender;
        }
    }


    /**
     * Return critical message thread information, such as the receiver's id and name and messages
     * @param {*} token 
     * @param {*} conversationId 
     * @param {*} res 
     */
    async getThread(token, conversationId, res) {
        const userId = await UserController.verifyTokenAndReturnUserId(token);

        if (!userId) {
            res.send("Invalid token");
            return;
        }

        const conversation = await Conversation.findById(conversationId);
        
        if (String(conversation.sender) != userId && String(conversation.receiver) != userId) {
            res.send({status:400, message:"Unauthorized"})
            return;
        }

        /* Determine who we will be sending messages to */
        const receiverId = this.determineReceiver(conversation.sender, conversation.receiver, userId);
        const receiverName = await UserController.getUsernameById(receiverId);

        /* Get messages */
        const messages = await Message.find({conversation: conversationId});
        
        res.send({receiverId: receiverId, receiverName: receiverName, messages: messages});

    }

    async getAllConversations(token, res) {
        const userId = await UserController.verifyTokenAndReturnUserId(token);

        if (!userId) {
            res.send("Invalid token");
            return;
        } 
        
        const conversations = await Conversation.find({$or: [{"sender": {$eq: userId}}, {"receiver": {$eq: userId}}]});

        res.send(conversations);

    }

    /*
    * @param: sender id
    * @param: receiver id
    * @return: The id of an already existing conversation between the sender and receiver, or false if no such conversation exists
    */
    async doesConversationAlreadyExist(sender, receiver) {
        const conversation = await Conversation.findOne({"sender": {$in: [sender,receiver]}, "receiver": {$in: [sender, receiver]}});
        return (conversation ? conversation._id : false);
    }

    async createNewMessageObjectAndUpdateConversation(message, conversationId, sender, date) {
        const newMessage = new Message({message: message, conversation: conversationId, sender: sender, date: date});
        newMessage.save();
        const senderUsername = await UserController.getUsernameById(sender);
        Conversation.findById(conversationId).then(conversation => {
            conversation.lastMessageDate = date;
            conversation.lastMessage = message;
            conversation.save();
        })
    }

    /*
    * 
    * @param: sender: sender id, 
    * @param: receiver: receiver id, 
    * @param: message: message payload
    * @param: conversationId: client specified conversation (optional) 
    */
    async addNewMessage(sender, receiver, message, conversationId=null) {

        //Sync up dates between conversation and message objects
        const currentDateAndTime = Date.now();

        //TODO: verify that existing conversation id is valid
        if (conversationId) {
            this.createNewMessageObjectAndUpdateConversation(message, conversationId, sender, currentDateAndTime)
            return;
        }

        //Even if we didn't receive a conversation id, still verify that one doesn't already exist before creating a new conversation
        const existingConversationId = await this.doesConversationAlreadyExist(sender, receiver);

        if (existingConversationId) {
            this.createNewMessageObjectAndUpdateConversation(message, existingConversationId, sender, currentDateAndTime)
        }
        else {
            const newConversation = await new Conversation({sender: sender, receiver: receiver}).save()
            this.createNewMessageObjectAndUpdateConversation(message, newConversation, sender, currentDateAndTime);

        }
    }
    
}

module.exports = ConversationController;