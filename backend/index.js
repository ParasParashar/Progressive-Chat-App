import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import groupRoute from "./routes/group.route.js";
import messageRoute from "./routes/messages.route.js";
import { app, server } from "./socket/socket.js";
import cors from "cors";
import { connectKafkaProducer } from "./kafka/kafka.config.js";
import { consumeMessages } from "./kafka/kafka.helper.js";
const PORT = process.env.PORT || 4000;

dotenv.config();

const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

app.use(cookieparser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "This is a advanced backend of the progressive chat app",
  });
});
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/group", groupRoute);

// adding the kafka consumer
consumeMessages(process.env.KAFKA_TOPIC);

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  // connect to kafka when the server is runnning
  connectKafkaProducer();
});
