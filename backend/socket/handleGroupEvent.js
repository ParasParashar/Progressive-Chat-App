export const handleGroupEvents = (
  socket,
  pubClient,
  subClient,
  getReceiverSocketId,
  io
) => {
  socket.on("join-group", (groupId) => {
    const groupChannel = `group:${groupId}`;
    socket.join(groupId);
    subClient.subscribe(groupChannel);
    console.log("User joined", groupId);

    subClient.on("message", (channel, message) => {
      if (channel === groupChannel) {
        const { type, data, groupMembers } = JSON.parse(message);
        switch (type) {
          case "group-message":
            groupMembers.forEach((user) => {
              const reciverSocketId = getReceiverSocketId(user.userId);
              io.to(reciverSocketId).emit("group-message", data);
            });
            break;
          case "group-message-update":
            io.to(groupId).emit("group-message-update", data);
            break;
        }
      }
    });
  });

  socket.on("leave-group", (groupId) => {
    socket.leave(groupId);
    subClient.unsubscribe(`group:${groupId}`);
    console.log(`User left group: ${groupId}`);
  });

  socket.on("groupTyping", ({ groupId, senderName }) => {
    io.to(groupId).emit("groupTyping", { groupId, senderName });
  });

  socket.on("stopGroupTyping", ({ groupId, senderName }) => {
    io.to(groupId).emit("stopGroupTyping", { groupId, senderName });
  });
};
