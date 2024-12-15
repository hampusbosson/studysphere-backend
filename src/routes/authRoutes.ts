import express, { Request, Response } from 'express';
import { createUser, verifyEmail, resendOTP, loginUser, getUserFromToken } from '../controllers/authController';
import { signupValidation } from '../validations/authValidations';

const router = express.Router();

// Define route
router.post('/signup', signupValidation, createUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP)
router.get('/getUserFromToken', getUserFromToken);

router.get('/users', (req: Request, res: Response) => {
  res.json({ message: 'User endpoints' });
});

export default router;