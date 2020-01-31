var express = require("express");
var mongoose = require("mongoose");
var app = express();

//setup
const UserController = new (require("./Controllers/UserController"))();
const ConversationController = new (require("./Controllers/ConversationController"))();
const socketServer = require("./io");

mongoose.connect("mongodb://localhost/whatsapplite", {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;

db.on("error", console.error.bind(console, 'connection error'));
db.once("open", function(){
    console.log("Successfully connected to database");
})

app.listen(3000);
app.use(express.urlencoded({extended: true}));


//routes
app.post("/signup", function(req,res){
    UserController.signup(req,res);
})

app.post("/login", function(req, res){
    UserController.login(req,res);
});

app.post("/verifyToken", function(req,res){
    UserController.verifyToken(req.body.token, res);
});

app.get("/api/getUsername/", function(req,res){
    UserController.getUsernameById(req.query.userId, res);
})

app.get("/api/getUserId", function(req,res){
    UserController.getUserIdbyUsername(req.query.username, res);
})
/**
 * Get all conversations for user 
 */
app.get("/api/conversations", function(req, res){
    ConversationController.getAllConversations(req.query.token, res);
});

/**
 * Write message to disk
 */
app.post("/api/messages/new", function(req,res){
    if (req.body.conversationId) {
        ConversationController.addNewMessage(req.body.sender, req.body.receiver, req.body.message, req.body.conversationId);
    }
    else{
        ConversationController.addNewMessage(req.body.sender, req.body.receiver, req.body.message)
    }
    res.send("Check server");
})

/**
 * Get all messages for a conversation
 */

 app.get("/api/messages/get", function(req,res){
     ConversationController.getThread(req.query.token, req.query.conversationId, res);
 })