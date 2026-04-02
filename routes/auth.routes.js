const express = require('express');
const router = express.Router();
const loginController = require('../controllers/auth/login.controller');
const registerController = require('../controllers/auth/register.controller');

router.get('/login', loginController.showLogin);
router.post('/login', loginController.login);
router.get('/register', registerController.showRegister);
router.post('/register', registerController.register);
router.get('/logout', loginController.logout);

module.exports = router;
