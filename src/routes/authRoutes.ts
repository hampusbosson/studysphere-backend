import express, { Request, Response } from 'express';
import { createUser, verifyEmail, resendOTP, loginUser, getUserFromSession, logoutUser, sendResetPasswordLink, resetPassword } from '../controllers/authController';
import { signupValidation } from '../middleware/validationMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Define route
router.post('/signup', signupValidation, createUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP)
router.get('/authenticate-token', authenticateToken);
router.post('/logout', logoutUser);
router.get('/session', authenticateToken, getUserFromSession);
router.post('/reset-password/request', sendResetPasswordLink);
router.post('/reset-password', resetPassword)

export default router;