import { NextFunction, Request, Response } from "express";
import * as passport from "passport";
import { IVerifyOptions } from "passport-local";

import { formatProfile } from "../auth/authService";
import { IUser, User } from "../models/user";
import HttpStatusCode from "../util/HttpStatusCode";

export class UserController {
  constructor() {
  }

  public async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    passport.authenticate(
      "local-signup",
      (err: Error, user: IUser, info: IVerifyOptions) => {
        if (err || !user) {
          const message = info ? info.message : "Invalid arguments.";
          return res.status(HttpStatusCode.BAD_REQUEST).json(message);
        }
        res.json(formatProfile(user.toJSON()));
      }
    )(req, res, next);
  }

  public async authenticateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    passport.authenticate("local-login", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: info.message });
      } else {
        res.json(formatProfile(user.toJSON()));
      }
    })(req, res, next);
  }

  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find();
      res.status(HttpStatusCode.OK).json({ users });
    } catch (error) {
      console.error("Error", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        timestamp: Date.now(),
        error: error.toString()
      });
    }
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findOne({ id: req.params.id });
      if (user === null) {
        res.sendStatus(HttpStatusCode.NOT_FOUND);
      } else {
        res.status(HttpStatusCode.OK).json(user);
      }
    } catch (error) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        timestamp: Date.now(),
        error: error.toString()
      });
    }
  }
}
