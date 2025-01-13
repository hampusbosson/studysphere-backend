import express from "express";
import { createClass, getClassesForUser } from "../controllers/classController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/create', authenticateToken, createClass);
router.get('/classes', authenticateToken, getClassesForUser);

export default router;