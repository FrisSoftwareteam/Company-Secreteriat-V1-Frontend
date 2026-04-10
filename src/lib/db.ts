import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createUnavailableClient() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error("DATABASE_URL is not configured.");
      },
    }
  ) as PrismaClient;
}

const prismaClient =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim()
    ? new PrismaClient()
    : createUnavailableClient();

export const db = global.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL?.trim()) {
  global.prisma = db;
}
