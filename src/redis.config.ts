import "dotenv/config";
import { createClient, type RedisClientOptions } from "redis";

for (const k of [
  "REDIS_USERNAME",
  "REDIS_PASSWORD",
  "REDIS_HOST",
  "REDIS_PORT",
]) {
  if (!process.env[k]) {
    console.error(`Missing ${k}. Copy .env.example to .env first.`);
    process.exit(1);
  }
}

const clientOptions: RedisClientOptions = {
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
  socket: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
  },
};
const redisClient = createClient(clientOptions);

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export default redisClient;
