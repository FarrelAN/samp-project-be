import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import util from "util";

const userController = {
  register: async (req, res, next) => {
    try {
      const {
        userAD,
        username,
        email,
        password,
        confirmPassword,
        role,
        division,
      } = req.body;
      const userExist = await User.findOne({ userAD: userAD });
      if (!!userExist) {
        return res
          .status(400)
          .json({ status: "failed", message: "User Already Exist" });
      }
      if (
        !userAD ||
        !username ||
        !email ||
        !password ||
        !confirmPassword ||
        !role ||
        !division
      ) {
        return res.status(400).json({
          status: "failed",
          message: "Please provide required details",
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: "failed",
          message: "Confirm password and Password do not match",
        });
      }
      let user = await User.create({
        userAD,
        username,
        email,
        password,
        role,
        division,
      });
      if (!user) {
        return res.status(500).json({
          status: "failed",
          message: "Something went wrong while creating the user",
        });
      }
      //Generate Token
      if (!!user) {
        const token = jwt.sign({ userId: user._id }, req.app.get("secretKey"), {
          expiresIn: "30m",
        });
        user.password = undefined;
        if (token) {
          return res.status(201).json({
            status: "success",
            message: "User Created Successfully",
            data: user,
            token: token,
          });
        }
      }
    } catch (err) {
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const { userAD, password } = req.body;
      if (!userAD || !password) {
        return res.status(400).json({
          status: "failed",
          message: "Please provide required details",
        });
      }
      const user = await User.findOne({ userAD });
      if (!user) {
        return res
          .status(401)
          .json({ status: "failed", message: "User Not Found", data: {} });
      }
      const bcryptCompare = util.promisify(bcrypt.compare);
      const result = await bcryptCompare(password, user.password);
      if (!result) {
        return res.status(401).json({
          status: "failed",
          message: "User AD or Password does not match",
          data: {},
        });
      }
      //Generate Token
      const token = jwt.sign({ userId: user._id }, req.app.get("secretKey"), {
        expiresIn: "30m",
      });
      user.password = undefined;
      if (token) {
        return res.status(200).json({
          status: "success",
          message: "User Found",
          data: user,
          token: token,
        });
      }
    } catch (err) {
      next(err);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { password, confirmPassword } = req.body;
      if (!password && !confirmPassword) {
        res
          .status(400)
          .json({ status: "falied", message: "All fiels are required" });
      }
      if (password !== confirmPassword) {
        res.status(400).json({
          status: "falied",
          message: "Password and Confirm Password should be same",
        });
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { password: password } }
      );
      if (!updatedUser) {
        res.status(404).json({ status: "Failure", message: "User not found" });
      }
      res.status(200).json({
        status: "success",
        message: "Password Changed Successfully!!",
      });
    } catch (err) {
      return res.status(500).json({ status: "failure", message: err.message });
    }
  },
  getUserDetails: async (req, res, next) => {
    try {
      if (!req.body.id) {
        return res
          .status(400)
          .json({ status: "failed", message: "No user Id found" });
      }
      const user = await User.findById(req.body.id).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "User not found" });
      }
      return res.status(200).json({
        status: "success",
        message: "User found Successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
  logout: () => {},
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

export { userController, getAllUsers };
