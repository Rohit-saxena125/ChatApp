const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 4000;
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// Serve static files
app.use(express.static("public"));
// Chat backup
const chatLog = [];
// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected     " + socket.id);
  // Send chat history to new user
  socket.emit("chatHistory", chatLog);
  socket.on("message", (data) => {
    chatLog.push(data);
    socket.broadcast.emit("chat-message", data);
  });
  // Handle image uploads
  socket.on("image", (data) => {
    chatLog.push(data);
    socket.broadcast.emit("image", data); // Broadcast the image to all other users
  });
  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Create a real time chat application using socket.io with chatroom feature and chat backup. Allow image sharing also in chat (image sharing is optional)
// Complete the task in express js