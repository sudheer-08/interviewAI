import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { validateEnv } from "./env.validation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

validateEnv();
