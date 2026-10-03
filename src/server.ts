import { app, PORT } from "./app";
import mongoose, { type ConnectOptions } from "mongoose";
import "dotenv/config";

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const connectionOptions: ConnectOptions = {};

(async () => {
  try {
    await mongoose.connect(dbURI, connectionOptions);
    console.log("database connected");

    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
  } catch (error) {}
})();
