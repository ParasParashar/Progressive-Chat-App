export const handleTypingEvents = (
  socket,
  pubClient,
  subClient,
  getReceiverSocketId
) => {
  socket.on("typing", ({ senderId, receiverId }) => {
    const typingData = { type: "typing", data: { senderId, receiverId } };
    pubClient.publish(`typing:user:${receiverId}`, JSON.stringify(typingData));
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const stopTypingData = {
      type: "stopTyping",
      data: { senderId, receiverId },
    };
    pubClient.publish(
      `typing:user:${receiverId}`,
      JSON.stringify(stopTypingData)
    );
  });

  // subscribe to typing events
  const userId = socket.handshake.query.userId;
  const typingChannel = `typing:user:${userId}`;

  subClient.subscribe(typingChannel);

  subClient.on("message", (channel, message) => {
    if (channel === typingChannel) {
      const { type, data } = JSON.parse(message);
      if (type === "typing") {
        socket.emit("typing", data);
      } else if (type === "stopTyping") {
        socket.emit("stopTyping", data);
      }
    }
  });
};
