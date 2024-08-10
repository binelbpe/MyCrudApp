const multer = require('multer');
const path = require('path');
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

const generateToken = (id) => {
  return jwt.sign({ id }, "secret", { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    let profileImagePath = '';
    if (req.file) {
      profileImagePath = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({ 
      username, 
      email, 
      password,
      profileImage: profileImagePath
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        profileImage: user.profileImage
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email", email);

    const user = await User.findOne({ email });
    console.log("user", user);

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log("req.user", req.user);
    const user = await User.findById(req.user._id);
    
    console.log("user", user);
    
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser: [upload.single('profileImage'), registerUser],
  loginUser,
  getUserProfile,
};