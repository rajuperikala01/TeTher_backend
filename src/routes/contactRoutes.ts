import { Request, Response, Router } from "express";
import prisma from "../db";
import { Prisma } from "@prisma/client";
import authorization from "../middlewares/authorization";

const router = Router();

router.get(
  "/getcontacts",
  authorization,
  async (req: Request, res: Response) => {
    const userId = req.userId;

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
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
        select: {
          friends: true,
        },
      });

      if (!user || user.friends.length === 0) {
        res.status(200).json({
          contacts: [],
        });
        return;
      }
      const contacts = await prisma.user.findMany({
        where: {
          id: {
            in: user?.friends,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!contacts) {
        res.status(400).json({
          error: "Can't found contacts. Try Again later",
        });
        return;
      }

      if (contacts.length === 0) {
        res.status(400).json({
          error: "No Contacts",
        });
        return;
      }

      res.status(200).json({
        contacts,
      });
      return;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({
          error: error.message,
        });
        return;
      }
      res.status(500).json({
        error: "An unknown error occurred. Please try again",
      });
      return;
    }
  }
);

export default router;
