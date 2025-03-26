import express from "express";
import { createCourse, getCoursesForUser, renameCourse, deleteCourse } from "../controllers/courseController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/create', authenticateToken, createCourse);
router.get('/courses', authenticateToken, getCoursesForUser);
router.post('/rename', authenticateToken, renameCourse);
router.post('/delete', authenticateToken, deleteCourse);

export default router;