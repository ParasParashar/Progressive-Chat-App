import { handleGroupMessage, handleOneToOneMessage } from "./createMessages.js";
import { consumer, producer } from "./kafka.config.js";
// producing messages using kafka and add to the topic
export const produceMessages = async (topic, message, isGroup = false) => {
  try {
    // creating partionKey to differentiate between group and personal messages
    const partitionKey = isGroup
      ? message.groupId
      : `${message.senderId}-${message.receiverId}`;

    await producer.send({
      topic: topic,
      messages: [
        {
          key: partitionKey,
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (error) {
    console.log(
      "Error in sending the message to kafka producer ",
      error.message
    );
  }
};

// consuming messages from topic and add to database
export const consumeMessages = async (topic) => {
  try {
    console.log("Kafka consumer setup successfully");
    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Consumer is working fine");
        if (!message.value) return;
        const parsedMessage = JSON.parse(message.value.toString());

        if (parsedMessage.groupId) {
          await handleGroupMessage(parsedMessage);
        } else {
          await handleOneToOneMessage(parsedMessage);
        }
      },
    });
  } catch (error) {
    console.log(
      "Error in consuming messages of the Kafka consumer:",
      error.message
    );
  }
};
