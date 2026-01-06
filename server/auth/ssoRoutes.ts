/**
 * Universal SSO Routes
 * Add SSO endpoints to any Express app
 */

import { Router, Request, Response } from "express";
import { UniversalSSOClient } from "./ssoClient";

export function setupSSORoutes(platformId: string, appUrl: string): Router {
  const router = Router();
  const ssoClient = new UniversalSSOClient(platformId, appUrl);

  // Redirect to SSO login
  router.get("/sso", (req: Request, res: Response) => {
    const state = Math.random().toString(36).substring(2, 15);
    res.cookie("sso_state", state, { httpOnly: true, maxAge: 600000 });
    const authUrl = ssoClient.getAuthorizationUrl(state);
    res.redirect(authUrl);
  });

  // SSO callback handler
  router.get("/sso/callback", async (req: Request, res: Response) => {
    try {
      const { token, error, state } = req.query;

      if (error) {
        console.error("[SSO] Callback error:", error);
        return res.redirect("/?error=sso_failed");
      }

      if (!token) {
        return res.redirect("/?error=no_token");
      }

      const result = await ssoClient.handleCallback(token as string);

      if (!result.success || !result.token) {
        return res.redirect("/?error=sso_failed");
      }

      // Set auth cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax"
      });

      // Redirect to home or dashboard
      res.redirect("/");
    } catch (error: any) {
      console.error("[SSO] Callback error:", error);
      res.redirect("/?error=sso_failed");
    }
  });

  // Logout
  router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.clearCookie("sso_state");
    res.json({ success: true });
  });

  router.get("/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.clearCookie("sso_state");
    res.redirect("/");
  });

  return router;
}

export { UniversalSSOClient };
