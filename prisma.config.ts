import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "server/.env") });

export default defineConfig({
    schema: "server/prisma/schema.prisma",
    migrations: {
        path: "server/prisma/migrations",
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});