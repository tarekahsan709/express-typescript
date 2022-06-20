import cookieParser = require("cookie-parser");
import dotenv = require("dotenv");
import express = require("express");
import morgan = require("morgan");
import passport = require("passport");
import path = require("path");

import db = require("./config/database");
import { API_BASE_URL, Enviroment } from "./config/secrets";
import { UserRoutes } from "./routes/userRoutes";
import { logger } from "./util/logger";

class Server {
  public app: express.Application;
  private db: db.Db;

  constructor() {
    this.app = express();
    this.db = new db.Db();
    this.configApp();
    this.initApp();
  }

  public start(): void {
    this.app.listen(this.app.get("port"), () => {
      logger.info("API is running at http://localhost:" + this.app.get("port"));
    });
  }

  private configApp(): void {
    dotenv.config();
    require("./config/passport")(passport);
  }

  private initApp(): void {
    this.db.connect();
    this.initExpressMiddleware();
    this.initCustomMiddleware();
    this.initRoutes();
  }

  private initExpressMiddleware(): void {
    this.app.set("port", process.env.PORT || 3000);
    this.app.use("/", express.static(path.join(__dirname, "../public")));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    if (process.env.NODE_ENV !== Enviroment.Test) {
      this.app.use(morgan("dev"));
    }
    process.on("uncaughtException", (err) => {
      if (err) {
        logger.error(err.stack);
      }
    });
  }

  private initCustomMiddleware(): void {
    if (process.platform === "win32") {
      require("readline")
        .createInterface({
          input: process.stdin,
          output: process.stdout
        })
        .on("SIGINT", () => {
          logger.info("SIGINT: Closing MongoDB connection");
          this.db.disconnect();
        });
    }

    process.on("SIGINT", () => {
      logger.info("SIGINT: Closing MongoDB connection");
      this.db.disconnect();
    });
  }

  private initRoutes(): void {
    this.app.use(`${API_BASE_URL}/users`, new UserRoutes().router);
  }
}

const server = new Server();
server.start();

module.exports = server.app;
