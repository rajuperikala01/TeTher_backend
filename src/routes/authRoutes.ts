import { Request, Response, Router } from "express";
import { signInSchema, signupSchema } from "../validationSchemas/authSchemas";
import prisma from "../db/index";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const validatedData = signupSchema.safeParse(req.body);
  console.log(validatedData.data);

  if (!validatedData.success) {
    res.status(401).json({
      error: validatedData.error.issues[0].message,
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

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    console.log("cookie set");

    res.status(200).json({
      message: "Successfull",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      error: "An Error Occurred please try again later",
    });
    return;
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  const validatedData = signInSchema.safeParse(req.body);

  if (!validatedData.success) {
    res.status(400).json({
      error: validatedData.error.issues[0].message,
    });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.data?.email,
      },
    });
    if (!existingUser) {
      res.status(400).json({
        error: "User with this Email does not exists",
      });
      return;
    }
    if (existingUser && validatedData.data?.password) {
      const authourized = await bcrypt.compare(
        validatedData.data.password,
        existingUser.password
      );

      if (!authourized) {
        res.status(400).json({
          error: "Incorrect password",
        });
        return;
      }
      const secret = process.env.JWT_SECRET || "";
      const token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        secret
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      res.status(200).json({
        message: "Login Successful",
        userId: existingUser.id,
        email: existingUser.email,
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      error: "An Error Occurred Please try again after sometime",
    });
    return;
  }
});

router.get("/getauth", (req: Request, res: Response) => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(403).json({
      Authenticated: false,
      error: "token required",
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "";

    const verification = jwt.verify(token, secret) as JwtPayload;

    if (verification.userId) {
      res.status(200).json({
        userId: verification.userId,
        email: verification.email,
        Authenticated: true,
      });
      return;
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
      res.status(500).json({ error: "Internal server error." });
      return;
    }
  }
});

export default router;
