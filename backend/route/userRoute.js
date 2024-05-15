import express from 'express';
import * as userController from '../controller/userController.js';
import isLoggedIn from '../util/authUtil.js';

const router = express.Router();

// 업데이트 된 라우트
router.get('/users/:user_id', isLoggedIn, userController.getUser);
router.post('/users/signup', userController.signupUser);
router.post('/users/login', userController.loginUser);
router.put('/users/:user_id', isLoggedIn, userController.updateUser);
router.patch(
    '/users/:user_id/password',
    isLoggedIn,
    userController.changePassword,
);
router.delete('/users/:user_id', isLoggedIn, userController.softDeleteUser);
router.get('/users/auth/check', isLoggedIn, userController.checkAuth);
router.post('/users/logout', isLoggedIn, userController.logoutUser);
router.get('/users/email/check', userController.checkEmail);
router.get('/users/nickname/check', userController.checkNickname);

export default router;