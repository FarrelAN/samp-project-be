import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDb.js";
import userRouter from "./routes/userRoutes.js";
import caseRouter from "./routes/caseRoutes.js";
import feedbackRouter from "./routes/feedbackRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DB_URL = process.env.DB_URL;
app.set("secretKey", process.env.SECRET_KEY);

// use routers
app.use("/user", userRouter);
app.use("/case", caseRouter);
app.use("/feedbacks", feedbackRouter); // Ensure this is the correct path
app.use("/message", messageRouter);

//connect database
connectDB(DB_URL);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("listening to port:", PORT);
});
