import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import passport from "../config/passportConfig";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

const createUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
      },
    });

    await sendEmail(
      email,
      "Verify Your Email",
      `Your OTP is: ${otp}. It will expire in 15 minutes.`,
    );
    res.status(201).json({
      message: "User registered. Please verify your email within 15 minutes.",
      newUser,
    });
    return;
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (user.verificationOtp !== otp) {
      res.status(400).json({ message: "Invalid OTP." });
      return;
    }

    if (
      !user.verificationOtpExpires ||
      user.verificationOtpExpires < new Date()
    ) {
      res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
      return;
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationOtp: null,
        verificationOtpExpires: null,
      },
    });

    res.json({ message: "Email verified successfully." });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error verifying email." });
  }
};

const resendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "Email is already verified." });
      return;
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
      },
    });

    await sendEmail(
      email,
      "New Verification OTP",
      `Your new OTP is: ${otp}. It will expire in 15 minutes.`,
    );

    res.json({
      message: "New OTP sent. Please verify your email within 15 minutes.",
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP." });
  }
};

const loginUser = (req: Request, res: Response, next: NextFunction): void => {
  console.log("Received login request body:", req.body); // Add this

  passport.authenticate(
    "local",
    { session: false },
    (err: Error, user: User | false, info: { message: string }) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Handle invalid credentials
      if (!user) {
        return res.status(400).json({
          message: info ? info.message : "Invalid email or password",
        });
      }

      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(403).json({
          message: "Please verify your email before logging in.",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email }, // JWT payload
        process.env.JWT_SECRET as string, // Secret key
        { expiresIn: "1h" }, // Token expiration
      );

      // Set the token as an HTTP-only cookie
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Send over HTTPS only in production
        sameSite: "strict", // CSRF protection
        maxAge: 3600000, // 1 hour
      });

      res.status(200).json({ message: "Login successful!" });
      console.log('login successful!')
    },
  )(req, res, next); 
};

const logoutUser = (req: Request, res: Response): void => {
  try {
    // clear the auth token cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout succesfull" });
  } catch(error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error during logout "});
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.authToken; // Extract the token from cookies
  
    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      req.user = decoded; // Attach user information to the request object
      next();
    } catch (err) {
      res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};

const getUserFromSession = async(req: Request, res: Response) => {
    try {
        const userId = (req.user as { id: string }).id;

        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) }, // Assumes `id` is numeric
        });
    
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }
    
        res.status(200).json({
          success: true,
          data: {
            id: user.id,
            email: user.email,
            isVerified: user.isVerified, 
          },
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
}

// Export the functions for use in routes
export { createUser, verifyEmail, resendOTP, loginUser, authenticateToken, getUserFromSession, logoutUser };
