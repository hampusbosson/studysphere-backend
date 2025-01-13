import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.authToken; // Extract the token from cookies
  
    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }
  
    try {
      // Decode the JWT and attach `user` with the `id` property
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      req.user = { id: decoded.id }; // Ensure req.user has `id`
      next();
    } catch (err) {
      res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
  };

export { authenticateToken };