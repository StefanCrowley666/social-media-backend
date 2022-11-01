import { Post, validatePost } from "../models/post.js";
import { User } from "../models/user.js";

export const getPost = async (req, res) => {
  try {
    //find post in the DB
    const post = await Post.findById(req.params.id);

    //Return post in DB
    return res.status(200).json(post);
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const addPost = async (req, res) => {
  try {
    //Validate the fields using Joi
    const { error } = validatePost(req.body);

    //Check if there is an error
    if (error) {
      return res.status(400).json({ err: error.details[0].message });
    }

    //Create new post
    const post = await new Post(req.body);

    //Save the post in the DB
    await post.save();

    //Return the post
    return res.status(200).json(post);
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const updatePost = async (req, res) => {
  try {
    //Find post from DB
    const post = await Post.findById(req.params.id);

    //Check if post credentials is valid
    if (req.user.id == post.userId || req.user.isAdmin) {
      //Update the post
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      //Return the updated post
      return res.status(200).json(updatedPost);
    }

    //Return the unautherized error
    return res.status(400).json({ err: "Unautherized to update post!" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const deletePost = async (req, res) => {
  try {
    //Find post in DB
    const post = await Post.findById(req.params.id);

    //Check Post credentials
    if (req.user.id == post.userId || req.user.isAdmin) {
      const deletedPost = await Post.findByIdAndDelete(req.params.id);
      return res.status(200).json(deletedPost);
    }

    //Return unautherized message
    return res.status(400).json({ err: "Unautherized to delete post!" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const likePost = async (req, res) => {
  try {
    //Find the liked post
    const likedPost = await Post.findById(req.params.id);

    //Check if there is any liek in the post
    if (likedPost.likes.includes(req.body.userId)) {
      return res.status(400).json({ err: "Already liked post!" });
    }

    //Update the post likes
    await likedPost.updateOne({ $push: { likes: req.body.userId } });

    //Return successfull message
    return res.status(200).json({ msg: "Liked Successfully" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const unlikePost = async (req, res) => {
  try {
    //Find the liked post
    const unlikedPost = await Post.findById(req.params.id);

    //Check if there is any liek in the post
    if (!unlikedPost.likes.includes(req.body.userId)) {
      return res.status(400).json({ err: "Already unliked this post!" });
    }

    //Update the post likes
    await unlikedPost.updateOne({ $pull: { likes: req.body.userId } });

    //Return successfull message
    return res.status(200).json({ msg: "unliked Successfully" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const getTimeline = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const currentUserPosts = await Post.find({ userId: currentUser._id });
    const friendsPosts = await Promise.all(
      //array of posts
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    //Return the timelien posts
    return res.status(200).json(currentUserPosts.concat(...friendsPosts));
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};
