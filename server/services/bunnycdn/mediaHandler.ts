import { randomUUID } from "crypto";

import dotenv from "dotenv";
dotenv.config({ path: "./env/.env.local" });

const BUNNY_REGION = process.env.BUNNY_REGION!;
const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME!;
const BUNNY_PASSWORD = process.env.BUNNY_PASSWORD!;

const BUNNY_BASE_URL = `https://${BUNNY_REGION}/${BUNNY_STORAGE_ZONE_NAME}`;
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL!; // e.g. https://myzone.b-cdn.net

const BUNNY_HEADERS = {
  AccessKey: BUNNY_PASSWORD,
};

export type UploadPurpose =
  | "avatar"
  | "cover_picture"
  | "verification_image"
  | "media_upload"
  | "registration"; 

/**
* Upload a file to Bunny CDN storage.
* @param fileBuffer - Raw file contents as a Buffer
* @param contentType - MIME type of the file (e.g. "image/jpeg")
* @param purpose - What the upload is for (avatar, cover_picture, verification_image, media_upload)
*/
const PURPOSE_DIRECTORY: Record<UploadPurpose, string> = {
    registration:       "registration",
    avatar:             "avatars",
    cover_picture:      "covers",
    verification_image: "verification",
    media_upload:       "media",
};

export async function uploadFile(
    fileBuffer: Buffer,
    contentType: string,
    purpose: UploadPurpose
): Promise<string> {
    const directory = PURPOSE_DIRECTORY[purpose];
    const uuid = randomUUID();
    const resolvedPath = `${directory}/${uuid}`;

    const response = await fetch(`${BUNNY_BASE_URL}/${resolvedPath}`, {
        method: "PUT",
        headers: {
            ...BUNNY_HEADERS,
            "Content-Type": contentType,
        },
        body: new Uint8Array(fileBuffer),
    });

    if (!response.ok) {
        throw new Error(`Bunny CDN upload failed: ${response.status} ${response.statusText}`);
    }

    return `${resolvedPath}`;
}


/**
* List all items in a directory inside the storage zone.
* @param directory - Path to the directory (e.g. "uploads/user123/"). Use "" for root.
*/
export async function listDirectory(directory: string): Promise<any[]> {
     // TODO: implement
    return [];
}


/**
* Fetch (download) a file from Bunny CDN storage.
* @param filePath - Path to the file inside the storage zone (e.g. "uploads/user123/photo.jpg")
* @returns File contents as a Buffer
*/
export async function fetchFile(filePath: string): Promise<Buffer> {
    // TODO: implement
    return Buffer.alloc(0);
}


/**
* Delete a file from Bunny CDN storage.
* @param filePath - Path to the file inside the storage zone (e.g. "uploads/user123/photo.jpg")
*/
export async function deleteFile(filePath: string): Promise<void> {
    // TODO: implement
}