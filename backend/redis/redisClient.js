import { Redis } from "ioredis";
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 24319,
  username: "default",
  password: process.env.REDIS_PASSWORD,
});
redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});
export { redis };
