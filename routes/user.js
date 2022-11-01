import express from "express";
import {
  getUsers,
  getUser,
  signup,
  login,
  updateUser,
  deleteUser,
} from "../controllers/user.js";
import { verifyToken } from "../middlewares/verifyToken.js";

//Router configuration
const router = express.Router();

//get users route
router.get("/", getUsers);

//get user route
router.get("/:id", getUser);

//Signup route
router.post("/signup", signup);

//Login route
router.post("/login", login);

//Update user
router.put("/:id", verifyToken, updateUser);

//Delete user
router.delete("/:id", verifyToken, deleteUser);

export default router;
