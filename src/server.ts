import { app, PORT } from "./app";
import mongoose, { type ConnectOptions } from "mongoose";
import "dotenv/config";
import redisClient from "./redis.config";

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const connectionOptions: ConnectOptions = { retryWrites: false };

(async () => {
  try {
    await redisClient.connect();
    console.log("redis connected!");

    await mongoose.connect(dbURI, connectionOptions);
    console.log("database connected");

    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
  } catch (error: unknown) {
    if (error instanceof Error) return console.error(error.message);
    return console.error("An unknown error occurred!");
  }
})();
