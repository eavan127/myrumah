import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "./prisma/schema.prisma",
    // @ts-expect-error - datasource.url is required for Prisma 7 db push but types may not reflect this
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
