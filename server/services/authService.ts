import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const BCRYPT_COST = 12;
const TOKEN_LENGTH = 32;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(): { token: string; hash: string } {
    const token = crypto.randomBytes(TOKEN_LENGTH).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    return { token, hash };
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async register(email: string, password: string, username?: string): Promise<{
    accountId: string;
    verificationToken: string;
  }> {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash = await this.hashPassword(password);
    const generatedUsername = username || email.split("@")[0] + "_" + Date.now().toString(36);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        username: generatedUsername,
        password: passwordHash,
        status: "active",
      })
      .returning();

    const { token } = this.generateToken();

    return {
      accountId: user.id,
      verificationToken: token,
    };
  }

  async verifyEmail(token: string): Promise<{ accountId: string }> {
    return { accountId: token };
  }

  async resendVerification(email: string): Promise<{ verificationToken: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new Error("Account not found");
    }

    const { token } = this.generateToken();
    return { verificationToken: token };
  }

  async login(
    email: string,
    password: string,
    ipAddress: string
  ): Promise<{ accountId: string; emailVerified: boolean }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isValid = await this.verifyPassword(password, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
      throw new Error("Account is suspended or inactive");
    }

    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      accountId: user.id,
      emailVerified: true,
    };
  }

  async initiatePasswordReset(email: string): Promise<{ resetToken: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      this.generateToken();
      return { resetToken: "" };
    }

    const { token } = this.generateToken();
    return { resetToken: token };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);
  }

  async getAccount(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: true,
      status: user.status,
      lastLoginAt: user.updatedAt,
      createdAt: user.createdAt,
    };
  }

  async getAccountByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: true,
      status: user.status,
      lastLoginAt: user.updatedAt,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
