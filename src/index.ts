import express, { Router } from "express";
import router from "./routes";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

const allowedOrigins = ["http://localhost:5173"];
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Cors"));
      }
    },
    credentials: true,
  })
);
app.use("/api/v1", router);

app.listen(5000, () => {
  console.log("Sever Started in 5000");
});
