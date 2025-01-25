import express from "express";
import { createLecture, getLecturesForClass, deleteLecture } from "../controllers/lectureController";

const router = express.Router();

router.post('/create', createLecture);
router.get('/lectures/:classId', getLecturesForClass);
router.post('/delete', deleteLecture);

export default router;