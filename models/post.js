import mongoose from "mongoose";
import Joi from "joi";

const postSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    likes: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const validatePost = (post) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    likes: Joi.array(),
  });
  return schema.validate(post);
};

export const Post = mongoose.model("Post", postSchema);
