import dotenv from "dotenv";
dotenv.config({ path: "./env/.env.local" });

import { uploadFile } from "../server/services/bunnycdn/mediaHandler";
import { readFileSync } from "fs";

const videoBuffer = readFileSync("./test/test-video.MOV");

uploadFile(videoBuffer, "video/mp4", "media_upload")
    .then(() => console.log("Upload successful"))
    .catch((err) => console.error("Upload failed:", err));