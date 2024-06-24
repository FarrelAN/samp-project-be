import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDb.js";
import userRouter from "./routes/userRoutes.js";
import caseRouter from "./routes/caseRoutes.js";
import feedbackRouter from "./routes/feedbackRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://farrelan.vercel.app"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DB_URL = process.env.DB_URL;
connectDB(DB_URL);

app.use("/user", userRouter);
app.use("/case", caseRouter);
app.use("/feedbacks", feedbackRouter);
app.use("/message", messageRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
