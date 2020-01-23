const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const conversationSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: "User"}, //indicates who initially started the conversations
    receiver: {type: Schema.Types.ObjectId, ref: "User"},
    lastMessageDate: {type: Date}, //represents the time the last message in the conversation history was recorded,
    lastMessageSender: {type: String}, //if the sender changes their username, this field must be updated
    lastMessage: {type: String},
})

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation