import express from "express";
import dotenv, { type DotenvConfigOptions } from "dotenv";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import router from "./routes/index.routes.js";
import { errorHanlder } from "./middleware/error.middleware.js";

const configOptions: DotenvConfigOptions = {};
dotenv.config(configOptions);

const app = express();
const PORT = process.env.NODE_PORT || 3000;

for (const k of ["CLIENT_URL", "NODE_PORT", "MONGODB_URI", "JWT_SECRET"]) {
  if (!process.env[k]) {
    console.error(`Missing ${k}. Copy .env.example to .env first.`);
    process.exit(1);
  }
}

const options: CorsOptions = {
  origin: [process.env.CLIENT_URL!],
  credentials: true,
};

app.use(cors(options));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("tiny"));

app.use("/", router);

app.use(errorHanlder);

export { app, PORT };
