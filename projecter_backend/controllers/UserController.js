const _ = require("lodash");
const bcrypt = require("bcrypt");

// Importing custom modules.
const userModel = require("../models/UserModel"); // User database model.
const sendToken = require("../utils/UserToken"); // Create JWT token function.

// Get all users.
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    if (users.length > 0) return res.json({ status: true, users });
    return res.status(404).json({ emptyUser: true, msg: "Users not found" });
  } catch (err) {
    return res.status(400).json({ status: false, msg: "Error getting users" });
  }
};

// Get one user by id. Currently logged in user via token.
module.exports.getOneUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (user) return res.json({ status: true, user });
    return res.status(404).json({ noUser: true, msg: "User not found" });
  } catch (err) {
    return res.status(400).json({ status: false, msg: "Error getting user" });
  }
};

// Create user.
module.exports.signup = async (req, res) => {
  try {
    let userData = _.pick(req.body, [
      "firstName",
      "lastName",
      "email",
      "password",
      "phoneNumber",
      "designation",
    ]);

    await userModel.create(userData);

    return res
      .status(201)
      .json({ status: true, msg: "User created successfully" });
  } catch (err) {
    if (err.keyPattern.email === 1) {
      res.status(400).json({ status: false, msg: "Email already exists" });
    } else if (err.keyPattern.phoneNumber === 1) {
      res
        .status(400)
        .json({ status: false, msg: "Phone number already exists" });
    } else {
      res.status(400).json({ status: false, msg: "Error in creating user" });
    }
  }
};

// Login user.
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const login = await userModel.findOne({ email }).select("+password");

  try {
    if (!login)
      res.status(404).json({ emailError: true, msg: "Could not find email" });

    const verify = await bcrypt.compare(password, login.password);

    if (!verify)
      res.status(401).json({ passwordError: true, msg: "Incorrect password" });

    return sendToken(login, 202, res);
  } catch (err) {
    console.log(err);
  }
};

// Delete user by id.
module.exports.deleteOneUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndRemove(req.params.id);

    if (!user)
      return res.status(404).json({ noUser: true, msg: "User not found" });

    return res
      .status(202)
      .json({ status: true, msg: "User deleted successfully" });
  } catch (err) {
    return res.status(400).json({ status: false, msg: "Error deleting user" });
  }
};

// Update user details.
module.exports.updateUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });

    if (!user) res.status(404).json({ noUser: true, msg: "User not found" });
    return res
      .status(202)
      .json({ status: true, msg: "User updated successfully" });
  } catch (err) {
    return res
      .status(404)
      .json({ status: false, msg: "Error updating users", err });
  }
};

// Update user password.
module.exports.updatePassword = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("+password");
    const passwordMatch = await user.comparePassword(req.body.currentPassword);

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ passwordError: true, msg: "Incorrect current password" });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({
        confirmPasswordError: true,
        msg: "Password does not match with each other",
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    return res
      .status(200)
      .json({ status: true, msg: "Password updated successfully" });
  } catch (err) {
    console.log(err);
  }
};

// Get one user by it's id. To fetch pm details on user/task page.
module.exports.getOneUserById = async (req, res) => {
  try {
    const userData = await userModel.findById(req.params.id);

    if (!userData) {
      return res.status(404).json({ noUser: true, msg: "User not found" });
    }

    return res.status(200).json({ status: true, msg: "User found", userData });
  } catch (err) {
    return res.status(404).json({ status: false, msg: "User not found", err });
  }
};

// Get multiple user data with their ObjectId for user/task page.
module.exports.getManyUsers = async (req, res) => {
  const userId = req.query.userId;

  try {
    const manyUsers = await userModel.find({
      _id: {
        $in: userId,
      },
    });

    return res
      .status(200)
      .json({ status: true, msg: "Users found successfully", manyUsers });
  } catch (err) {
    res.status(504).json({ status: false, msg: "Error getting users" });
  }
};
