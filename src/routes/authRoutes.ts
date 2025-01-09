import express, { Request, Response } from 'express';
import { createUser, verifyEmail, resendOTP, loginUser, authenticateToken, getUserFromSession } from '../controllers/authController';
import { signupValidation } from '../validations/authValidations';

const router = express.Router();

// Define route
router.post('/signup', signupValidation, createUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP)
router.get('/authenticate-token', authenticateToken);

router.get('/session', authenticateToken, getUserFromSession);

export default router;