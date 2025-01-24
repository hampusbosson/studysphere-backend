import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { fetchContentFromURL, summarizeContent } from "../services/contentService";

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
      content = await fetchContentFromURL(url);
      content = await summarizeContent(content)
    }

    const newLecture = await prisma.lecture.create({
      data: {
        title: lectureTitle,
        content,
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

const getLecturesForClass = async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;

            // Validate input
        if (!classId) {
            res
            .status(400)
            .json({ message: "classId is required." });
            return;
        }

        const lectures = await prisma.lecture.findMany({
            where: { classId: (parseInt(classId)) }, 
            orderBy: { createdAt: "asc" }
        });

        res.status(200).json({message: "lectures recieved succesfully", lectures})
    } catch (error) {
        console.error("Error fetching lectures:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createLecture, getLecturesForClass };
