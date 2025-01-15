import express from "express";
import { createClass, deleteClass, getClassesForUser, renameClass } from "../controllers/classController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/create', authenticateToken, createClass);
router.get('/classes', authenticateToken, getClassesForUser);
router.post('/rename', authenticateToken, renameClass);
router.post('/delete', authenticateToken, deleteClass);

export default router;