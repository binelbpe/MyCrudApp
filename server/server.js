const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

app.use(noCache);
app.use(cors({
  origin: process.env.LOCAL_HOST,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

mongoose.connect(process.env.MONGODB_CONNECT)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/', userRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`));
