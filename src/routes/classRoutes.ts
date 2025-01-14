import express from "express";
import { createClass, getClassesForUser, renameClass } from "../controllers/classController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/create', authenticateToken, createClass);
router.get('/classes', authenticateToken, getClassesForUser);
router.post('/rename', authenticateToken, renameClass)

export default router;