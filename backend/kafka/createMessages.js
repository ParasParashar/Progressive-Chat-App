import prisma from "../db/prisma.js";
import { redis } from "../redis/redisClient.js";

// Handling one-to-one messages
export const handleOneToOneMessage = async (parsedMessage) => {
  try {
    const { senderId, receiverId, message: text } = parsedMessage;

    // Check if a conversation exists between sender and receiver
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantsIds: {
          hasEvery: [senderId, receiverId],
        },
      },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantsIds: {
            set: [senderId, receiverId],
          },
          isGroupChat: false,
        },
      });
    }

    // Create a new message
    const newMessage = await prisma.message.create({
      data: {
        senderId: senderId,
        body: text,
        conversationId: conversation.id,
        seenByIds: [senderId],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullname: true,
            profilePic: true,
            username: true,
          },
        },
      },
    });

    // Update conversation with the new message
    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        fullname: true,
        profilePic: true,
        username: true,
      },
    });

    const sendMessage = { ...newMessage, receiver };
    // Notify users via Redis
    redis.publish(
      `user:${receiverId}`,
      JSON.stringify({
        type: "new-message",
        data: sendMessage,
      })
    );
    redis.publish(
      `user:${senderId}`,
      JSON.stringify({
        type: "new-message",
        data: sendMessage,
      })
    );
  } catch (error) {
    console.log(
      "Error in creatin a one-to-one message using kafka",
      error.message
    );
  }
};

// Handling group messages
export const handleGroupMessage = async (parsedMessage) => {
  try {
    const { senderId, groupId, message } = parsedMessage;
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    // Finding or creating the conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        groupId: groupId,
        isGroupChat: true,
      },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          groupId: groupId,
          isGroupChat: true,
        },
      });
    }
    const newMessage = await prisma.message.create({
      data: {
        senderId: senderId,
        body: message,
        groupId: groupId,
        conversationId: conversation.id,
        seenByIds: [senderId],
      },
      include: {
        sender: {
          select: {
            profilePic: true,
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
    });
    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });
    const groupInfo = {
      id: group.id,
      fullname: group.name,
    };
    const messageSend = { ...newMessage, groupInfo };
    redis.publish(
      `group:${groupId}`,
      JSON.stringify({
        type: "group-message",
        data: messageSend,
        groupMembers: group.members,
      })
    );
  } catch (error) {
    console.log("Error in creating a group message using kafka", error.message);
  }
};
