import { PrismaClient } from "@prisma/client";

// Step 1: Tell TypeScript that `global` can have a `prisma` property
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Step 2: Reuse existing Prisma client if available, otherwise create a new one
const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Step 3: Store Prisma in `global` to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Step 4: Export Prisma client for use across the project
export default prisma;
