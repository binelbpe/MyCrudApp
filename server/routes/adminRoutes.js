const express = require('express');
const { loginAdmin, getUser,getUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');
const { adminProtect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', loginAdmin);
router.get('/users', adminProtect, getUsers); 
router.get('/users/:id', adminProtect, getUser);
router.post('/users/create', adminProtect, createUser);
router.put('/users/:id', adminProtect, updateUser);
router.delete('/users/:id', adminProtect, deleteUser);

module.exports = router;
