import { Request } from "express";

// Extending the Request type to include `userId`
declare global {
  namespace Express {
    interface Request {
      userId?: string | number; // Add userId with an optional type (string or number)
    }
  }
}
