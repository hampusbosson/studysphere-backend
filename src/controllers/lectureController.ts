import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import {
  fetchContentFromURL,
  summarizeContent,
} from "../services/contentService";
import axios from "axios";

const prisma = new PrismaClient();

const createLecture = async (req: Request, res: Response) => {
  try {
    const { classId, lectureTitle, url } = req.body;

    // Validate input
    if (!classId || !lectureTitle) {
      res
        .status(400)
        .json({ message: "classId and lectureTitle are required." });
      return;
    }

    let content = "";
    if (url) {
      console.log("url has been entered", url);
      content = await fetchContentFromURL(url);
      console.log("Fetching of content complete!");
    }

    const newLecture = await prisma.lecture.create({
      data: {
        title: lectureTitle,
        content,
        url,
        class: {
          connect: { id: parseInt(classId) },
        },
      },
    });

    res
      .status(201)
      .json({ message: "Lecture created succesfully", newLecture });
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const summarizeLecture = async (req: Request, res: Response) => {
  try {
    console.log("Summarizing lecture...");
    const { lectureId } = req.body;

    // Validate input
    if (!lectureId) {
      res.status(400).json({ message: "LectureId is required." });
      return;
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: parseInt(lectureId) },
    });

    if (!lecture) {
      res.status(404).json({ message: "Lecture not found." });
      return;
    }

    const summary = await summarizeContent(lecture.content);

    const updatedLecture = await prisma.lecture.update({
      where: { id: parseInt(lectureId) },
      data: { summarizedContent: summary },
    });

    res.status(200).json({
      message: "Lecture summarized successfully",
      updatedLecture,
    });
  } catch (error) {
    console.error("Error summarizing lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLectureById = async (req: Request, res: Response) => {
  try {
    const { classId, lectureId } = req.params;

    if (!classId || !lectureId) {
      res.status(400).json({ message: "classId and lectureId are required." });
      return;
    }

    const lecture = await prisma.lecture.findUnique({
      where: {
        id: parseInt(lectureId),
        classId: parseInt(classId),
      },
    });

    if (!lecture) {
      res.status(404).json({ message: "Lecture not found." });
      return;
    }

    res.status(200).json({ message: "Lecture fetched successfully", lecture });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLecturesForClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    // Validate input
    if (!classId) {
      res.status(400).json({ message: "classId is required." });
      return;
    }

    const lectures = await prisma.lecture.findMany({
      where: { classId: parseInt(classId) },
      orderBy: { createdAt: "asc" },
    });

    res
      .status(200)
      .json({ message: "lectures recieved succesfully", lectures });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteLecture = async (req: Request, res: Response) => {
  try {
    const { lectureId } = req.body;

    // Validate input
    if (!lectureId) {
      res.status(400).json({
        message: "LectureId is required.",
      });
      return;
    }

    // Delete the lecture
    const lecture = await prisma.lecture.delete({
      where: { id: parseInt(lectureId) },
    });

    res.status(200).json({
      message: "Lecture deleted successfully",
      lecture,
    });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const setPdfCorsHeader = async (req: Request, res: Response) => {
  const pdfUrl = req.query.url as string;

  if (!pdfUrl) {
    res.status(400).json({ message: "URL paramater is required." });
    return;
  }

  try {
    const response = await axios.get(pdfUrl, { responseType: "stream" });

    res.set("Access-Control-Allow-Origin", "*");

    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }

    response.data.pipe(res);
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createLecture,
  getLecturesForClass,
  getLectureById,
  deleteLecture,
  setPdfCorsHeader,
  summarizeLecture,
};
