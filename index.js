import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/user.js";
import postRoute from "./routes/post.js";

//App configuration
dotenv.config();

//App variables
const PORT = process.env.PORT || 8000;
const app = express();

//Express middlewares
app.use(express.json());
app.use(cors());

//App middlewares
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

//Root page middleware
app.get("/", (req, res) => {
  return res.status(200).json({ msg: "Root page created!" });
});

//404 page middleware
app.use((req, res, next) => {
  return res.status(404).json({ err: "Page not found!" });
});

//Connecting to the DB
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};
connectDB();

//Initiating the app
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
