import { Request, Response, NextFunction } from "express";
import { PrismaClient, User, Class } from "@prisma/client";

const prisma = new PrismaClient();

const createClass = async (req: Request, res: Response) => {
    const { className, userId } = req.body;

    try {
        const newClass = await prisma.class.create({
            data: {
                name: className,
                user: {
                    connect: { id: userId }
                }
            }
        })

        res.status(201).json({ message: "Class created successfully", newClass });
    } catch (error: any) {
        console.error("Error creating class:", error);
        
        // Handle specific errors (e.g., unique constraint violations)
        if (error.code === "P2002") {
            res
            .status(400)
            .json({ message: "Class name must be unique. This name already exists." });
            return;
        }

        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export { createClass }