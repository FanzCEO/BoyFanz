// From blueprint:javascript_auth_all_persistance - Authentication system implementation
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { loginUserSchema, registerUserSchema, User as SchemaUser } from "@shared/schema";
import { z } from "zod";

type AuthUser = Omit<SchemaUser, 'password'>;

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupLocalAuth(app: Express) {
  // Local username/password authentication strategy
  passport.use("local", new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || user.authProvider !== "local") {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      // Don't include password in session
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }));

  // Local auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const userData = {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        firstName: validatedData.firstName || null,
        lastName: validatedData.lastName || null,
        authProvider: "local" as const,
        status: "active" as const,
        profileImageUrl: null,
      };

      const user = await storage.createUser(userData);
      
      // Log in the user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't return password
        const { password: _, ...userResponse } = user;
        res.status(201).json(userResponse);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate request body
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        
        if (!user) {
          return res.status(401).json({ 
            message: info?.message || "Invalid username or password" 
          });
        }
        
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
}