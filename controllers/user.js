import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, validateUser } from "../models/user.js";

export const signup = async (req, res) => {
  try {
    //Destructure the field from req.body
    const { email, password } = req.body;

    //Validate the fields using Joi
    const { error } = validateUser(req.body);

    //Check if there is an error
    if (error) {
      return res.status(400).json({ err: error.details[0].message });
    }

    //Generate the salts
    const salt = await bcrypt.genSalt(10);

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);

    //Check if user exist in db
    const user = await User.findOne({ email });

    //Create a new user in the db
    if (!user) {
      const createdUser = await new User({
        ...req.body,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      //Save user in the db
      await createdUser.save();

      //Extract the password field
      const { password, ...others } = createdUser._doc;

      //Return created user
      return res.status(201).json(others);
    }

    //Return error message
    return res.status(400).json({ err: "User already exists!" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const login = async (req, res) => {
  try {
    //Check if user exist in DB
    const user = await User.findOne({ email: req.body.email });

    //Not found error message
    if (!user) {
      return res.status(400).json({ err: "User not found!" });
    }

    //Validate password
    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    //Password not valid error message
    if (!validatePassword) {
      return res.status(400).json({ err: "Password is not valid!" });
    }

    //Create user token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    //Extract the password field
    const { password, ...others } = user._doc;

    //Return the user object with token
    return res.status(200).json({ ...others, token });
  } catch (err) {
    //Return the server error
    return res.status(500).json(err);
  }
};

export const getUsers = async (req, res) => {
  try {
    //New query
    const newQ = req.query.new;

    //Get users
    const users = newQ
      ? await User.find({}).sort({ createdAt: -1 })
      : await User.find({});

    //Return the users
    return res.status(200).json(users);
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const getUser = async (req, res) => {
  try {
    //Find user in DB
    const user = await User.findById(req.params.id);

    //Not found error Message
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    //Extract password from user
    const { password, ...others } = user._doc;

    //Return the user
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.user.id == req.params.id || req.user.isAdmin) {
      //Generate salt
      const salt = await bcrypt.genSalt(10);

      //Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      //Assign hashed password to the body
      req.body.password = hashedPassword;

      //Update the user
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      //Extract the password field
      const { password, ...others } = updatedUser._doc;

      //Return the updated user
      return res.status(200).json(others);
    }
    return res.status(400).json({ err: "Unautherized to update!" });
  } catch (err) {
    //Return server Error
    return res.status(500).json(err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.id == req.params.id || req.user.isAdmin) {
      //Find user and delete it
      const deletedUser = await User.findByIdAndDelete(req.params.id);

      //Extract the password field
      const { password, ...others } = deletedUser._doc;

      //Return the deleted user
      return res.status(200).json(others);
    }

    //Return unautherized message
    return res.status(400).json({ err: "Unautherized to delete!" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const followUser = async (req, res) => {
  try {
    //Get the followed user
    const followedUser = await User.findById(req.params.id);

    //Get the current user
    const currentUser = await User.findById(req.body.userId);

    //Check if you follow the user or not
    if (followedUser.followers.includes(req.body.userId)) {
      return res.status(400).json({ err: "You already follow this user!" });
    }

    //Update the followers field
    await followedUser.updateOne({ $push: { followers: req.body.userId } });

    //Update the following field
    await currentUser.updateOne({ $push: { following: req.params.id } });

    //Return successfull message
    return res.status(200).json({ msg: "Followed Successfully!" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};

export const unfollowUser = async (req, res) => {
  try {
    //Get the unfollowed user
    const unfollowedUser = await User.findById(req.params.id);

    //Get the current user
    const currentUser = await User.findById(req.body.userId);

    //Check if you follow the user or not
    if (!unfollowedUser.followers.includes(req.body.userId)) {
      return res.status(400).json({ err: "You already unfollow this user!" });
    }

    //Update the followers field
    await unfollowedUser.updateOne({ $pull: { followers: req.body.userId } });

    //Update the following field
    await currentUser.updateOne({ $pull: { following: req.params.id } });

    //Return successfull message
    return res.status(200).json({ msg: "Unfollowed Successfully!" });
  } catch (err) {
    //Return server error
    return res.status(500).json(err);
  }
};
