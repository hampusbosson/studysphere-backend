import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createClass = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id; // Extract userId from req.user
    const { className } = req.body; // Get className from the request body

    const newClass = await prisma.class.create({
      data: {
        name: className,
        user: {
          connect: { id: parseInt(userId) }, // Use userId from req.user
        },
      },
    });

    res.status(201).json({ message: "Class created successfully", newClass });
  } catch (error: any) {
    console.error("Error creating class:", error);

    if (error.code === "P2002") {
      res
        .status(400)
        .json({ message: "Class name must be unique. This name already exists." });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

const getClassesForUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id;

    const userClasses = await prisma.class.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'asc' }, // Sort classes by creation time
      include: { lectures: true },
    });

    res.status(200).json({ message: "Classes received successfully", userClasses });
  } catch (error) {
    console.error("Error receiving classes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const renameClass = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id;

    const { classId, newName } = req.body;

    const updatedClass = await prisma.class.update({
      where: {
        id: classId,
        userId: parseInt(userId),
      },
      data: {
        name: newName.trim(),
      }
    });    
  
      res.status(200).json({ message: "Class renamed successfully", updatedClass });
  } catch (error) {
    console.error("Error renaming classes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteClass = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      res.status(401).json({ message: "Unauthorized: User ID not found" });
      return;
    }

    const userId = (req.user as { id: string }).id;

    const { classId } = req.body;

    // Ensure the class belongs to the user before deletion
    const classToDelete = await prisma.class.findFirst({
      where: {
        id: classId,
        userId: parseInt(userId), // Ensure the class belongs to the user
      },
    });

    if (!classToDelete) {
      res.status(404).json({ message: "Class not found or not authorized" });
      return;
    }

    const deletedClass = await prisma.class.delete({
      where: {
        id: classId,
      }
    })

    res.status(200).json({ message: "Class removed succesfully", deletedClass }); 
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { createClass, getClassesForUser, renameClass, deleteClass }