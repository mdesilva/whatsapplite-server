const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type:String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    socketId: String
});

const User = mongoose.model('User', userSchema);

module.exports = User