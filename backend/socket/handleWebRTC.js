export const handleWebRTCEvents = (
  socket,
  pubClient,
  subClient,
  getReceiverSocketId,
  io
) => {
  const userId = socket.handshake.query.userId;
  const webrtcChannel = `webrtc:user:${userId}`;

  subClient.subscribe(webrtcChannel);

  subClient.on("message", (channel, message) => {
    if (channel === webrtcChannel) {
      const { type, data } = JSON.parse(message);
      switch (type) {
        case "call-offer":
          socket.emit("incomming:call", data);
          break;
        case "call-answer":
          socket.emit("call:accepted", data);
          break;
        case "peer-nego-needed":
          socket.emit("peer:nego:needed", data);
          break;
        case "peer-nego-final":
          socket.emit("peer:nego:done", data);
          break;
        case "create:user:call":
          const receiverSocketId = getReceiverSocketId(data.receiverId);
          io.to(receiverSocketId).emit("create:user:call", data);
          break;
      }
    }
  });
  socket.on("room:join", (data) => {
    const { userId, room, receiverId, fullname } = data;
    console.log("webRTC joined room", data);
    const socketId = getReceiverSocketId(userId);
    socket.join(room);
    io.to(room).emit("user:joined", { userId: userId, socketId: socketId });
    io.to(socket.id).emit("room:join", data);
    const parsedData = {
      type: "create:user:call",
      data: data,
    };
    pubClient.publish(`webrtc:user:${receiverId}`, JSON.stringify(parsedData));
  });
  socket.on("user:call", ({ to, offer }) => {
    const callData = { type: "call-offer", data: { from: socket.id, offer } };
    pubClient.publish(`webrtc:user:${to}`, JSON.stringify(callData));
  });

  socket.on("call:accepted", ({ to, ans }) => {
    const answerData = { type: "call-answer", data: { from: socket.id, ans } };
    pubClient.publish(`webrtc:user:${to}`, JSON.stringify(answerData));
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    const negoNeededData = {
      type: "peer-nego-needed",
      data: { from: socket.id, offer },
    };
    pubClient.publish(`webrtc:user:${to}`, JSON.stringify(negoNeededData));
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    const negoDoneData = {
      type: "peer-nego-final",
      data: { from: socket.id, ans },
    };
    pubClient.publish(`webrtc:user:${to}`, JSON.stringify(negoDoneData));
  });

  socket.on("call:disconnected", ({ to, room }) => {
    const userInRoom = room.split(":");
    const receiverId = userInRoom.find((id) => id !== userId);
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("call:disconnected", { from: socket.id });
    socket.leave(room);
  });

  socket.on("call:rejected", ({ userId, room, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("call:rejected", { room: room });
    io.to(room).emit("call:rejected", { room: room });
    socket.leave(room);
  });
};
