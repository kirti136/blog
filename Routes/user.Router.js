const { Router } = require("express");
const { UserModel } = require("../Models/UserModel");
const { BlacklistModel } = require("../Models/BlacklistModel");
const { authMiddleware } = require("../Middlewares/auth.Middleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRouter = Router();

// Get Data
userRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.find();
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Register a new User
userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User Exists Already, Please Login" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({ name, email, password: hashPassword, role });
    await user.save();

    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Login
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "Invalid Email" });
    }

    const ValidPassword = await bcrypt.compare(password, user.password);
    if (!ValidPassword) {
      return res.status(400).send({ message: "Invalid Password" });
    }

    // Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1m",
    });
    // Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "3m",
      }
    );

    // Valid email and Password
    if (user && ValidPassword) {
      return res
        .status(201)
        .send({ message: "User Log in succesfully", token, refreshToken });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// Logout
userRouter.post("/logout", authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const blacklistToken = new BlacklistModel({ token });
    await blacklistToken.save();
    res.status(200).send({ message: "User Logged out successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Refresh tokens
userRouter.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Verify refresh token
    if (decoded) {
      const token = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        {
          expiresIn: "1m",
        }
      );
      res.status(200).send({ token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// Update User
userRouter.patch("/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body);

    if (!user) {
      return res.status(400).send({ message: "User Not Found" });
    } else {
      res.status(200).send({ message: "User Updated successfully!" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Delete User
userRouter.delete("/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(400).send({ message: "User Not Found" });
    }
    res.status(200).send({ message: `${user.name} Data Deleted Successfully` });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = {
  userRouter,
};
