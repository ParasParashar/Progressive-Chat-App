import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import express from "express";
import { redis } from "../redis/redisClient.js";
import { handleWebRTCEvents } from "./handleWebRTC.js";
import { handleTypingEvents } from "./handleTypingEvent.js";
import { handleGroupEvents } from "./handleGroupEvent.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
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
  handleTypingEvents(socket, pubClient, subClient, getReceiverSocketId, io);
  handleGroupEvents(socket, pubClient, subClient, getReceiverSocketId, io);
  handleWebRTCEvents(socket, pubClient, subClient, getReceiverSocketId, io);
  socket.on("call:rejected", ({ userId, room, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("call:rejected", { room: room });
    io.to(room).emit("call:rejected", { room: room });
    socket.leave(room);
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
