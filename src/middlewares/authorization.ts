import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default async function authorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.auth_token;
  const secret = process.env.JWT_SECRET || "";

  try {
    const verification = await jwt.verify(token, secret);
    console.log(verification);
  } catch (error) {}
}
