const express = require("express");
const port = 8000;
const port1 = 8001;
const app = express();

require("./db");
require("./models/User");
require("./models/Message");
const authRoutes = require("./routes/authRoutes");
const uploadMediaroutes = require("./routes/uploadMediaRoutes");
const messageRoutes = require("./routes/messageRoutes");
const bodyParser = require("body-parser");
//requiretoken skipped

//make socket io
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpserver = createServer();
const io = new Server(httpserver, {});

app.use(bodyParser.json());
app.use(authRoutes);
app.use(uploadMediaroutes);
app.use(messageRoutes);
app.get("/", (req, res) => {
  res.send("hello");
});
//YOu can connect socket with same port also, but here we will use different port
//connection command will run when user call from frontend, socket has it's random id, and user connected with it.
//we create room after connected , and room will also give you previous chats
//  in room we will make separate room id with both user's username or id's, and save chats from that room id in database.
//call user's socket id and room id both
//socket.join(data) to show chats
// we will make "send message" call with socket.on
// to receive other side we will make io.emmit
//socket.io does not give previous chats, that saved in database, it gives only real time chat, to save previous chats we will give router to it.

io.on("connection", (socket) => {
  console.log("USER CONNECTED", socket.id);
  socket.on("disconnect", (data) => {
    console.log("USER CONNECTED", socket.id);
  });

  socket.on("join_room", (data) => {
    console.log(
      "USER WITH SOCKET ID:",
      socket.id,
      "JOIN ROOM ID:",
      data.roomid
    );
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    console.log("MESSAGE received data", data);
    io.emit("recieve_message", data); // When we tap on send this code will send data to receiver
  });
});

//connect with other port, port1

httpserver.listen(port1, () => {
  console.log(" socket server running at port 8001", port1);
});

app.listen(port, () => {
  console.log("server is running on port" + port);
});
