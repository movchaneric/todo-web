const express = require('express');
const router = express.Router();

const userController = require('../../controllers/userController');
const user = require('../../models/user');

router.get('/login', userController.getLoginUser);

router.post('/login-user', userController.postLoginUser);

router.get('/register', userController.getRegisterUser);

router.post('/register-user', userController.postUserRegister)

router.post('/logout', userController.postUserLogOut);

router.get('/login', userController.getUserLogOut);

router.get('/reset-page', userController.getResetPassword);

router.post('/reset-page', userController.postResetPassword);

router.get('/reset-password/:token', userController.getResetForm);

router.post('/reset-password', userController.postResetForm);

router.get('/profile-page', userController.getProfilePage)

router.post('/update-profile', userController.postProfiePage); //post method is working

module.exports = router;