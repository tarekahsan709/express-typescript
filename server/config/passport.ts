import * as passportJwt from "passport-jwt";
import * as passportLocal from "passport-local";

import { User } from "../models/user";
import { JWT_SECRET } from "./secrets";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

module.exports = (passport: any) => {
  /*
   * PASSPORT SESSION SETUP
   * required for persistent login sessions
   * passport needs ability to serialize and unserialize users out of session
   */
  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: any, done: any) => {
    User.findById(id, (err: any, user: any) => {
      done(err, user);
    });
  });

  /*
   * LOCAL SIGNUP
   * we are using named strategies since we have one for login and one for signup
   * by default, if there was no name, it would just be called 'local'
   */
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req: any, email: any, password: any, done: any) => {
        process.nextTick(() => {
          User.findOne({ email }, (err: any, user: any) => {
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, false, {
                message: "User with this email already exist!"
              });
            } else {
              const newUser = new User();
              newUser.name = req.body.name;
              newUser.email = email;
              newUser.password = newUser.generateHash(password);
              newUser.save((newUserSavingError: any) => {
                if (newUserSavingError) {
                  throw newUserSavingError;
                }
                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );

  /*
   * LOCAL LOGIN
   * we are using named strategies since we have one for login and one for signup
   * by default, if there was no name, it would just be called 'local'
   */
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req: any, email: any, password: any, done: any) => {
        User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(undefined, false, {
              message: `email ${email} not found.`
            });
          }
          user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              return done(undefined, user);
            }
            return done(undefined, false, {
              message: "Invalid username or password."
            });
          });
        });
      }
    )
  );
  // FIXME: Refactoring
  /*
   * JWT STRATEGY
   * to verify the validity of json web token
   */
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET
      },
      (jwtPayload: any, done: any, req: any) => {
        User.findOne({ _id: jwtPayload._id }, (err: any, user: any) => {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      }
    )
  );
};
