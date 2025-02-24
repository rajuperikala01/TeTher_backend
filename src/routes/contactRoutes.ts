import { Request, Response, Router } from "express";
import prisma from "../db";

const router = Router();

router.get("/getcontacts/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    res.clearCookie("auth_token", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(403).json({
      error: "user not found. Signin Again",
    });
  }

  try {
    const user = await prisma.user.findMany({
      where: {
        id: Number(userId),
      },
      select: {
        friends: true,
      },
    });

    console.log(user);
    res.send("hi");
    return;
  } catch (error) {}
});
