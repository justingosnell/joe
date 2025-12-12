
import "dotenv/config";
import path from "path";
import fs from "fs";

async function checkMulter() {
  console.log("Checking Multer...");
  try {
    const multerModule = await import("multer");
    console.log("Multer module imported:", Object.keys(multerModule));
    const multer = multerModule.default;
    console.log("Multer default export type:", typeof multer);
    
    if (typeof multer === 'function') {
        const upload = multer({ storage: multer.memoryStorage() });
        console.log("Multer instance created successfully");
    } else {
        console.error("Multer default export is not a function!");
    }
  } catch (error) {
    console.error("Failed to import multer:", error);
  }
}

function checkEnv() {
  console.log("Checking Environment Variables...");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "SET" : "MISSING");
  console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "SET" : "MISSING");
  console.log("SUPABASE_BUCKET:", process.env.SUPABASE_BUCKET ? "SET" : "MISSING");
}

async function main() {
  checkEnv();
  await checkMulter();
}

main();
