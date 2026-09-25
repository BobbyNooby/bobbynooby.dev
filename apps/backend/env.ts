import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Must be imported before any module whose top-level code checks process.env:
// ESM evaluates imports in order, so this loads the repo-root .env first.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
