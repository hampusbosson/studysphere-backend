import { body, ValidationChain } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const signupValidation: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .custom(async (email: string) => {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new Error('Email is already taken.');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 7 })
    .withMessage('Password must be at least 7 characters long.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least on letter')
];

export { signupValidation };