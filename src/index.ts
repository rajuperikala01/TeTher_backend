import express, { Router } from "express";
import router from "./routes";
import dotenv from "dotenv";
const app = express();
dotenv.config();
app.use(express.json());

app.use("/api", router);

app.listen(5000, () => {
  console.log("Sever Started in 5000");
});
