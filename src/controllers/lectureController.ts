import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createLecture = async (req: Request, res: Response) => {
  try {
    const { classId, lectureTitle } = req.body;

    // Validate input
    if (!classId || !lectureTitle) {
      res
        .status(400)
        .json({ message: "classId and lectureTitle are required." });
      return;
    }

    const newLecture = await prisma.lecture.create({
      data: {
        title: lectureTitle,
        content: "",
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

export { createLecture };
