import express from "express";
import {
  addPost,
  updatePost,
  deletePost,
  getPost,
  likePost,
  unlikePost,
  getTimeline,
} from "../controllers/post.js";
import { verifyToken } from "../middlewares/verifyToken.js";

//Router configuration
const router = express.Router();

//Get all posts
router.get("/", getTimeline);

//Get post
router.get("/:id", getPost);

//Add post
router.post("/", addPost);

//Update post
router.put("/:id", verifyToken, updatePost);

//Delete post
router.delete("/:id", verifyToken, deletePost);

//Like post
router.put("/like/:id", likePost);

//unlike post
router.put("/unlike/:id", unlikePost);

export default router;
