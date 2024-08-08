import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import path from "path";
import authRoute from "./routes/auth.route.js";
import groupRoute from "./routes/group.route.js";
import messageRoute from "./routes/messages.route.js";
import { app, server } from "./socket/socket.js";
dotenv.config();
const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();
app.use(cookieparser());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/group", groupRoute);

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  console.log("Server started");
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}
server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
