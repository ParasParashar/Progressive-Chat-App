import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { redis } from "../redis/redisClient.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE"],
  },
});
// Create Redis Pub/Sub clients
const pubClient = redis.duplicate();
const subClient = redis.duplicate();
io.adapter(createAdapter(pubClient, subClient));
const userSocketMap = {};
// utility functions
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
io.on("connection", (socket) => {
  console.log("socket is connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    // adding the socket id with the userId
    userSocketMap[userId] = socket.id;
    // io.emit is used to send the message to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Subscribe to Redis channel for the user
    const userChannel = `user:${userId}`;
    subClient.subscribe(userChannel);
    subClient.on("message", (channel, message) => {
      if (channel === userChannel) {
        const { type, data } = JSON.parse(message);
        switch (type) {
          case "new-message":
            socket.emit("new-message", data);
            break;
          case "updated-message":
            socket.emit("updated-message", data);
            break;
        }
      }
    });
  }
  // emit the typing message
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId, receiverId });
    }
  });
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId, receiverId });
    }
  });
  // emit the group typing message
  socket.on("groupTyping", ({ groupId, senderName }) => {
    io.emit("groupTyping", { groupId, senderName });
  });
  socket.on("stopGroupTyping", ({ groupId, senderName }) => {
    io.emit("stopGroupTyping", { groupId, senderName });
  });
  // emit the group join message
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log("user joind", groupId);
    subClient.subscribe(`group:${groupId}`);
    subClient.on("message", (channel, message) => {
      const { type, data, groupMembers } = JSON.parse(message);
      switch (type) {
        case "group-message":
          console.log(data, "mesage group");
          groupMembers.forEach((user) => {
            const reciverSocketId = getReceiverSocketId(user.userId);
            io.to(reciverSocketId).emit("group-message", data);
          });
          break;
        case "group-message-update":
          io.to(groupId).emit("group-message-update", data);
          break;
      }
    });
  });
  socket.on("leave-group", (groupId) => {
    socket.leave(groupId);
    subClient.unsubscribe(`group:${groupId}`);
    console.log(`User left group: ${groupId}`);
  });
  // handle the webRTC
  socket.on("room:join", (data) => {
    const { userId, room } = data;
    console.log("webRTC joined room", data);
    const socketId = getReceiverSocketId(userId);
    socket.join(room);
    io.to(room).emit("user:joined", { userId: userId, socketId: socketId });
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });
  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  socket.on("call:disconnected", ({ to }) => {
    console.log("socket disconnected, remove call");
    io.to(to).emit("call:disconnected", { from: socket.id });
  });

  // socker.on is used to listen to the events. for both client and the server
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { app, io, server };
