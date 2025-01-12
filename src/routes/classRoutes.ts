import express from "express";
import { createClass } from "../controllers/classController";

const router = express.Router();

router.post('/create', createClass);

export default router;