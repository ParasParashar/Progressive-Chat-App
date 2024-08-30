import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  logLevel: logLevel.ERROR,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "kafka-chatapp" });

export const connectKafkaProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka Producer connected...");
  } catch (err) {
    console.log("Kafka Consumer error", err.message);
  }
};
