import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";

import { JWT_SECRET } from "../config/secrets";

// FIXME: Refactor return
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns undefined
 */
export function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate("jwt", { session: false })(req, res, next);
}

// FIXME: Check sign
/**
 * Returns a jwt token signed by the app secret
 */
export function generateAccessToken(user): any {
  console.log("Generate access token", user);
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "3d",
    issuer: user._id.toString()
  });
}

/**
 * Returns the user profile with access token
 */
export function formatProfile(user): any {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    token: this.generateAccessToken(user)
  };
}
