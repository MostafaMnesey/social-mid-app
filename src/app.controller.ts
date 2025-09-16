//third-party middlewares
import cors from "cors";
import { config } from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
//express & types
import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerDocument from "../Docs/social_app_swagger.json";

//core
import { resolve } from "path";

//controllers
import authController from "./Modules/Auth/auth.controller";
import userController from "./Modules/User/user.controller";
import { globalErrorHandler } from "./utils/error.response";
import DbConnection from "./DB/Connection.db";
//configurations & constants
config({ path: resolve("./config/.env.development") });
//rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
});

//bootstrap function starting point of the app
const bootstrap = async (): Promise<void> => {
  //port number
  const port: number | string = /* process.env.PORT || */ 3001;
  //express app
  const app = express();
  //Third-party-middlewares
  app.use(express.json(), cors(), helmet(), morgan("dev"), limiter);

  //Application routes
  app.use("/auth", authController);
  app.use("/user", userController);

  // swagger docs
  app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // invalid route
  app.use("{/*dummy}", (req: Request, res: Response) => {
    return res.status(404).json({ error: "Invalid route" });
  });
  //db connection
  await DbConnection();
  // error handler
  app.use(globalErrorHandler);
  //server listening
  app.listen(port, () => {
    console.log(`Server is running on port ${port} 🚀`);
  });
};

export default bootstrap;
