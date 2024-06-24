import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const auth = async (req, res, next) => {
  let token = req.header("Authorization");
  console.log("tolennnnn", token);
  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const verifiedUser = jwt.verify(token, req.app.get("secretKey"));
      const user = await User.findOne({ _id: verifiedUser.userId }).select(
        "-password"
      );
      console.log("user>>>>>", user);
      req.user = user;
      next();
    } catch (err) {
      console.log(err, "errr>>>>>>>>>");
      if (err.name == "TokenExpiredError") {
        res.status(401).json({
          status: "failed",
          message: "Token expired, please login again",
        });
      } else {
        res
          .status(401)
          .json({ status: "failed", message: "User not verified" });
      }
    }
  } else {
    res
      .status(401)
      .json({ status: "failed", message: "User doesn't have valid token" });
  }
};

export default auth;
