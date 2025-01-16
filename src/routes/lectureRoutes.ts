import express from "express";
import { createLecture } from "../controllers/lectureController";

const router = express.Router();

router.post('/create', createLecture);

export default router;