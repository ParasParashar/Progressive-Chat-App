export const handleWebRTCEvents = (
  socket,
  pubClient,
  subClient,
  getReceiverSocketId,
  io
) => {
  const userId = socket.handshake.query.userId;
  // const webrtcChannel = `webrtc:user:${userId}`;

  //   subClient.subscribe(webrtcChannel);

  //   subClient.on("message", (channel, message) => {
  //     if (channel === webrtcChannel) {
  //       const { type, data } = JSON.parse(message);
  //       switch (type) {
  //         case "call-offer": {
  //           const receiverSocketId = getReceiverSocketId(data.to);

  //           //   socket.emit("incomming:call", data);
  //           io.to(receiverSocketId).emit("incomming:call", data);
  //           break;
  //         }
  //         case "call-answer": {
  //           const receiverSocketId = getReceiverSocketId(data.to);

  //           //   socket.emit("call:accepted", data);
  //           io.to(receiverSocketId).emit("call:accepted", data);

  //           break;
  //         }
  //         case "peer-nego-needed": {
  //           const receiverSocketId = getReceiverSocketId(data.to);

  //           //   socket.emit("peer:nego:needed", data);
  //           io.to(receiverSocketId).emit("peer:nego:needed", data);

  //           break;
  //         }
  //         case "peer-nego-final": {
  //           const receiverSocketId = getReceiverSocketId(data.to);

  //           //   socket.emit("peer:nego:done", data);
  //           io.to(receiverSocketId).emit("peer-nego-final", data);
  //           break;
  //         }
  //         case "create:user:call": {
  //           const receiverSocketId = getReceiverSocketId(data.receiverId);
  //           io.to(receiverSocketId).emit("create:user:call", data);
  //           break;
  //         }
  //       }
  //     }
  //   });
  //   socket.on("room:join", (data) => {
  //     const { userId, room, receiverId, fullname } = data;
  //     console.log("webRTC joined room", data);
  //     socket.join(room);
  //     io.to(room).emit("user:joined", { userId: userId, socketId: userId });
  //     io.to(socket.id).emit("room:join", data);
  //     const parsedData = {
  //       type: "create:user:call",
  //       data: data,
  //     };
  //     pubClient.publish(`webrtc:user:${receiverId}`, JSON.stringify(parsedData));
  //   });
  //   socket.on("user:call", ({ to, offer }) => {
  //     const callData = { type: "call-offer", data: { from: userId, offer } };
  //     pubClient.publish(`webrtc:user:${to}`, JSON.stringify(callData));
  //   });

  //   socket.on("call:accepted", ({ to, ans }) => {
  //     const answerData = { type: "call-answer", data: { from: userId, ans } };
  //     pubClient.publish(`webrtc:user:${to}`, JSON.stringify(answerData));
  //   });

  //   socket.on("peer:nego:needed", ({ to, offer }) => {
  //     const negoNeededData = {
  //       type: "peer-nego-needed",
  //       data: { from: userId, offer },
  //     };
  //     pubClient.publish(`webrtc:user:${to}`, JSON.stringify(negoNeededData));
  //   });

  //   socket.on("peer:nego:done", ({ to, ans }) => {
  //     const negoDoneData = {
  //       type: "peer-nego-final",
  //       data: { from: userId, ans },
  //     };
  //     pubClient.publish(`webrtc:user:${to}`, JSON.stringify(negoDoneData));
  //   });

  // socket.on("call:disconnected", ({ to, room }) => {
  //   const userInRoom = room.split(":");
  //   const receiverId = userInRoom.find((id) => id !== userId);
  //   const receiverSocketId = getReceiverSocketId(receiverId);
  //   io.to(receiverSocketId).emit("call:disconnected", { from: socket.id });
  //   socket.leave(room);
  // });

  // socket.on("call:rejected", ({ userId, room, receiverId }) => {
  //   const receiverSocketId = getReceiverSocketId(receiverId);
  //   io.to(receiverSocketId).emit("call:rejected", { room: room });
  //   io.to(room).emit("call:rejected", { room: room });
  //   socket.leave(room);
  // });

  // --------------------older way without pub sub
  socket.on("room:join", (data) => {
    const { userId, room, receiverId, fullname } = data;
    console.log("webRTC joined room", data);
    const socketId = getReceiverSocketId(userId);
    socket.join(room);
    io.to(room).emit("user:joined", { userId: userId, socketId: socketId });
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(socket.id).emit("room:join", data);
    /* event for to call the user and user notification for the call */
    io.to(receiverSocketId).emit("create:user:call", data);
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
  socket.on("call:disconnected", ({ to, room }) => {
    const userInRoom = room.split(":");
    const receiverId = userInRoom.find((id) => id !== userId);
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("call:disconnected", { from: socket.id });
    socket.leave(room);
  });
};
