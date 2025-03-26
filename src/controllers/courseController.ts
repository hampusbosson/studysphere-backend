import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createCourse = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id; // Extract userId from req.user
    const { courseName } = req.body; // Get className from the request body

    const newClass = await prisma.class.create({
      data: {
        name: courseName,
        user: {
          connect: { id: parseInt(userId) }, // Use userId from req.user
        },
      },
    });

    res.status(201).json({ message: "Course created successfully", newClass });
  } catch (error: any) {
    console.error("Error creating course:", error);

    if (error.code === "P2002") {
      res
        .status(400)
        .json({ message: "Course name must be unique. This name already exists." });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

const getCoursesForUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id;

    const userCourses = await prisma.class.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'asc' }, // Sort classes by creation time
      include: { lectures: true },
    });

    res.status(200).json({ message: "Classes received successfully", userCourses });
  } catch (error) {
    console.error("Error receiving classes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const renameCourse = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id;

    const { courseId, newName } = req.body;

    const updatedClass = await prisma.class.update({
      where: {
        id: courseId,
        userId: parseInt(userId),
      },
      data: {
        name: newName.trim(),
      }
    });    
  
      res.status(200).json({ message: "Course renamed successfully", updatedClass });
  } catch (error) {
    console.error("Error renaming courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteCourse = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id;

    const { courseId } = req.body;

    // Ensure the class belongs to the user before deletion
    const courseToDelete = await prisma.class.findFirst({
      where: {
        id: courseId,
        userId: parseInt(userId), // Ensure the class belongs to the user
      },
    });

    if (!courseToDelete) {
      res.status(404).json({ message: "Course not found or not authorized" });
      return;
    }

    const deletedCourse = await prisma.class.delete({
      where: {
        id: courseId,
      }
    })

    res.status(200).json({ message: "Course removed succesfully", deletedCourse }); 
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { createCourse, getCoursesForUser, renameCourse, deleteCourse }