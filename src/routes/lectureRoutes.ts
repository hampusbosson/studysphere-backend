import express from "express";
import { createLecture, getLecturesForClass } from "../controllers/lectureController";

const router = express.Router();

router.post('/create', createLecture);
router.get('/lectures/:classId', getLecturesForClass);

export default router;