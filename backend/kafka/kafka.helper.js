import prisma from "../db/prisma.js";
import { redis } from "../redis/redisClient.js";
import { consumer, producer } from "./kafka.config.js";

export const produceMessages = async (topic, message) => {
  try {
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log("message sent to kafka ", message);
  } catch (error) {
    console.log(
      "Error in sending the message to kafka producer ",
      error.message
    );
  }
};

export const consumeMessages = async (topic) => {
  try {
    console.log("Kafka consumer setup successfully");
    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Consumer is woring fine");
        if (!message.value) return;
        const {
          senderId,
          receiverId,
          message: text,
        } = JSON.parse(message.value.toString());

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

        // Notify users via Redis or Socket.IO
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
      },
    });
  } catch (error) {
    console.log(
      "Error in consuming messages of the Kafka consumer",
      error.message
    );
  }
};
