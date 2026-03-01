import bcrypt from "bcrypt";
import { db } from "../../db";
import { accounts, creatorSignup } from "../../../shared/schemas/registration";
import { uploadFile } from "../bunnycdn/mediaHandler";

export interface ImageFile {
  buffer: Buffer;
  contentType: string;
}

export interface CreatorSignupInput {
  // Account credentials
  email: string;
  phone?: string;
  password: string;

  // Profile
  handle: string;
  displayName: string;
  bio?: string;
  styleAttitude?: string[];
  website?: string;
  socialLinks?: Record<string, string>;

  // Legal / KYC
  legal_first_name: string;
  legal_last_name: string;
  dob: string;         // "YYYY-MM-DD"
  country: string;
  state?: string;
  id_type: string;
  id_number: string;
  expiry_date: string; // "YYYY-MM-DD"

  // Image files (idBack is optional, everything else required)
  idFront: ImageFile;
  idBack?: ImageFile;
  selfieWithId: ImageFile;
  avatar?: ImageFile;
  banner?: ImageFile;
}

export async function registerCreator(input: CreatorSignupInput) {
    console.log("Registering creator with input")
    // Hash password and upload all images concurrently
    const [
        passwordHash,
        idFrontUrl,
        selfieWithIdUrl,
        idBackUrl,
        avatarUrl,
        bannerUrl,
    ] = await Promise.all([
        bcrypt.hash(input.password, 12),
        uploadFile(input.idFront.buffer, input.idFront.contentType, "registration"),
        uploadFile(input.selfieWithId.buffer, input.selfieWithId.contentType, "registration"),
        input.idBack
        ? uploadFile(input.idBack.buffer, input.idBack.contentType, "registration")
        : Promise.resolve(undefined as string | undefined),
        input.avatar
        ? uploadFile(input.avatar.buffer, input.avatar.contentType, "avatar")
        : Promise.resolve(undefined as string | undefined),
        input.banner
        ? uploadFile(input.banner.buffer, input.banner.contentType, "cover_picture")
        : Promise.resolve(undefined as string | undefined),
    ]);

    // 1. Create account record
    const [account] = await db
        .insert(accounts)
        .values({
        email: input.email,
        phone: input.phone,
        passwordHash,
        status: "pending", // stays pending until email verified
        emailVerified: false,
        phoneVerified: false,
        })
        .returning();

    // 2. Create creator signup record linked to the account
    const [creatorRecord] = await db
        .insert(creatorSignup)
        .values({
        accountId: account.id,
        handle: input.handle,
        displayName: input.displayName,
        bio: input.bio,
        legal_first_name: input.legal_first_name,
        legal_last_name: input.legal_last_name,
        dob: input.dob,
        country: input.country,
        state: input.state,
        id_type: input.id_type,
        id_number: input.id_number,
        expiry_date: input.expiry_date,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        selfie_with_id_url: selfieWithIdUrl,
        styleAttitude: input.styleAttitude ?? [],
        avatarUrl,
        bannerUrl,
        website: input.website,
        socialLinks: input.socialLinks ?? {},
        type: "creator",
        kycStatus: "pending",
        })
        .returning();

    return { account, creator: creatorRecord };
}
