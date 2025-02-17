import { Request, Response, Router } from "express";
import { signupSchema } from "../validationSchemas/authSchemas";
import prisma from "../db/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const validatedData = signupSchema.safeParse(req.body);

  if (!validatedData.success) {
    res.status(401).json({
      error: validatedData.error.issues[0],
    });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.data.email,
      },
    });
    if (existingUser) {
      res.status(400).json({
        error: "User With this email already Exists",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      error: "Unknown Error",
    });
    return;
  }

  const hash = await bcrypt.hash(validatedData.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.data.firstName,
        lastName: validatedData.data.lastName,
        email: validatedData.data.email,
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const secret = process.env.JWT_SECRET || "";
    const token = jwt.sign({ id: user.id, email: user.email }, secret);
  } catch (error) {}
});

export default router;
