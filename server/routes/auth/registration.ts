import { Router, Request, Response } from "express";
import multer from "multer";
import { registerCreator } from "../../services/registration/creatorSignupService";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadFields = upload.fields([
  { name: "idFront", maxCount: 1 },
  { name: "idBack", maxCount: 1 },
  { name: "selfie", maxCount: 1 },   // frontend sends "selfie"
]);

// POST /api/auth/creator-signup
router.post("/creator-signup", uploadFields, async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  // Validate required files
  if (!files?.idFront?.[0]) {
    return res.status(400).json({ error: "idFront image is required" });
  }
  if (!files?.selfie?.[0]) {
    return res.status(400).json({ error: "Selfie with ID is required" });
  }

  // Frontend field names (camelCase)
  const {
    email,
    password,
    username,       // used as both handle and displayName
    legalFirstName,
    legalLastName,
    dateOfBirth,
    country,
    state,
    idType,
    idNumber,
    idExpiryDate,
  } = req.body;

  // Validate required text fields
  const required: Record<string, string> = {
    email,
    password,
    username,
    legalFirstName,
    legalLastName,
    dateOfBirth,
    country,
    idType,
    idNumber,
    idExpiryDate,
  };
  for (const [field, value] of Object.entries(required)) {
    if (!value) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  try {
    const idFront = files.idFront[0];
    const idBack = files.idBack?.[0];
    const selfie = files.selfie[0];

    const result = await registerCreator({
      // Account
      email,
      password,

      // Map username → handle + displayName
      handle: username,
      displayName: username,

      // Legal / KYC — map camelCase → snake_case expected by service
      legal_first_name: legalFirstName,
      legal_last_name: legalLastName,
      dob: dateOfBirth,
      country,
      state,
      id_type: idType,
      id_number: idNumber,
      expiry_date: idExpiryDate,

      // Files
      idFront: { buffer: idFront.buffer, contentType: idFront.mimetype },
      idBack: idBack ? { buffer: idBack.buffer, contentType: idBack.mimetype } : undefined,
      selfieWithId: { buffer: selfie.buffer, contentType: selfie.mimetype },
    });

    return res.status(201).json({
      message: "Registration successful. Your application is under review.",
      accountId: result.account.id,
      creatorId: result.creator.id,
    });
  } catch (err: any) {
    // Postgres unique violation
    if (err.code === "23505") {
      const detail: string = err.detail ?? "";
      if (detail.includes("email")) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      if (detail.includes("handle") || detail.includes("display_name")) {
        return res.status(409).json({ error: "This username is already taken" });
      }
      return res.status(409).json({ error: "Duplicate entry" });
    }

    console.error("[registration] registerCreator error:", err);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

export default router;
