import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function authorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.auth_token;
  const secret = process.env.JWT_SECRET || "";

  if (!token) {
    res.status(403).json({
      error: "Unauthorized",
    });
    return;
  }
  try {
    const verification = (await jwt.verify(token, secret)) as JwtPayload;
    if (verification.userId) {
      req.userId = verification.userId;
      next();
    }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired. Please log in again." });
      return;
    } else if (error.name === "JsonWebTokenError") {
      res.status(403).json({ error: "Invalid token. Not authenticated." });
      return;
    } else if (error.name === "NotBeforeError") {
      res.status(403).json({ error: "Token is not active yet." });
      return;
    } else {
      res.status(403).json({
        error: "Unauthorized",
      });
      return;
    }
  }
}
