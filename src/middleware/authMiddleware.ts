import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.authToken; // Extract the token from cookies
  
    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      req.user = decoded; // Attach user information to the request object
      next();
    } catch (err) {
      res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};

export { authenticateToken };