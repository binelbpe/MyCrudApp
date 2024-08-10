const multer = require('multer');
const path = require('path');
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, 'secret', { expiresIn: '30d' });
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password)) && user.isAdmin) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({isAdmin:false});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

const createUser = async (req, res) => {
  try {
    console.log("newuser body", req.body);
    const { username, email, password, isAdmin } = req.body;
    let profileImage = "";

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password, isAdmin, profileImage });
    console.log("new user", user);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.file) {
        if (user.profileImage) {
          user.profileImage = `/uploads/${req.file.filename}`;
        }
      }

      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      await user.save();
      res.json({ message: 'User updated' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  loginAdmin, 
  getUser, 
  getUsers, 
  createUser: [upload.single('profileImage'), createUser], 
  updateUser: [upload.single('profileImage'), updateUser], 
  deleteUser 
};