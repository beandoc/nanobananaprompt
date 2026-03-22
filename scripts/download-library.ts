import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load env from .env.local
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const PROMPT_LIBRARY_KEY = "nb_prompt_library";
const DOWNLOAD_DIR = path.join(process.cwd(), "medical_assets", "building_blocks");

async function downloadLibrary() {
  console.log("🚀 Starting library download from Redis...");

  // Ensure download dir exists
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  try {
    const data = await redis.lrange(PROMPT_LIBRARY_KEY, 0, -1);
    console.log(`📦 Found ${data.length} items in library.`);

    for (const item of data) {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      
      // We only want to save 'medical' or high-value items as building blocks
      if (parsed.type === "medical") {
        const subject = parsed.content.scientific_subject || "untitled";
        const filename = `${subject.toLowerCase().replace(/[^a-z0-9]/g, "_")}.json`;
        const filePath = path.join(DOWNLOAD_DIR, filename);

        fs.writeFileSync(filePath, JSON.stringify(parsed.content, null, 2));
        console.log(`✅ Downloaded: ${filename}`);
      }
    }

    console.log("\n✨ Library download complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to download library:", error);
    process.exit(1);
  }
}

downloadLibrary();
