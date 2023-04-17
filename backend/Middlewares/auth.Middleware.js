const jwt = require("jsonwebtoken");
require("dotenv").config();

const { UserModel } = require("../Models/UserModel");
const { BlacklistModel } = require("../Models/BlacklistModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const Blacklisted = await BlacklistModel.findOne({ token });
    if (Blacklisted) {
      return res.status(401).send({ message: "Token is blacklisted" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decodedToken;

    // user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({ message: "Access token expired" });
    } else {
      return res.status(401).json({ message: error.message });
    }
  }
};

module.exports = {
  authMiddleware,
};
