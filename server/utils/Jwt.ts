import { Response } from "express";
import { IUser } from "../model/User";
import { redis } from "../config/redis";
import dotenv from "dotenv";

// load env variables
dotenv.config();

// Type for Access & Refresh token options object
interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// Parse Access Token & Refresh Token expiry into a numeral with fallback value
const accessTokenExpiry = parseInt(
  process.env.ACCESS_TOKEN_EXPIRY || "300",
  10
);
const refreshTokenExpiry = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY || "1200",
  10
);

// Options object for Access Token
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpiry * 60 * 60 * 1000),
  maxAge: accessTokenExpiry * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

// Options object for Refresh Token
export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

// sendToken function - this function generates access & refresh token and save them in cookie, save user to redis db & send access token in response
export function sendToken(user: IUser, statusCode: number, res: Response) {
  // generate access token & refresh token
  const accessToken = user.signInAccessToken();
  const refreshToken = user.signInRefreshToken();

  // Save session to redis
  redis.set(user._id, JSON.stringify(user) as any);

  // Set secure property of access token options object to true only in production mode
  if (process.env.NODE_DEV === "production") {
    accessTokenOptions.secure = true;
  }

  // Save the Access & Refresh Token to cookie
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  res.cookie("access_token", accessToken, accessTokenOptions);

  // Send user & access token in response
  return res.status(statusCode).json({
    success: true,
    message: "logged in successfully",
    user,
    accessToken,
  });
}
