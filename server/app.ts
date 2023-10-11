import cookieParser from "cookie-parser";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/UserRoute";

// Initialize express app
export const app = express();

// Body parser to attach data coming with request to request body
app.use(express.json());

// Cookie parser so that we can add cookies from backend to browser or client
app.use(cookieParser());

// Cors to specify origin from where user request the end points
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// user routes
app.use("/api/v1", userRouter);

// Test route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    success: true,
    message: "Test route",
  });
});

// Unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// error middleware
app.use(ErrorMiddleware);
