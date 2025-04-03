import express from "express";
import { createLecture, getLecturesForClass, deleteLecture, setPdfCorsHeader, summarizeLecture, getLectureById } from "../controllers/lectureController";

const router = express.Router();

router.post('/create', createLecture);
router.post('/summarize', summarizeLecture);
router.get('/lecture/:lectureId', getLectureById);
router.get('/lectures/:classId', getLecturesForClass);
router.post('/delete', deleteLecture);
router.get('/proxy', setPdfCorsHeader);


export default router;