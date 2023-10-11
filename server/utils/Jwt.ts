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

// Save refresh & access token to cookie & send user object & access token in response
export function sendToken(user: IUser, statusCode: number, res: Response) {
  // generate access token & refresh token
  const accessToken = user.signInAccessToken();
  const refreshToken = user.signInRefreshToken();

  // Save session to redis
  redis.set(user._id, JSON.stringify(user) as any);

  // Parse Access Token & Refresh Token expiry into a numeral with fallback value
  const accessTokenExpiry = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY || "300",
    10
  );
  const refreshTokenExpiry = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY || "1200",
    10
  );

  // Define options object for Access Token
  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiry * 1000),
    maxAge: accessTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  // Define options object for Refresh Token
  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpiry * 1000),
    maxAge: refreshTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  // Set secure property of access token options object to true only in production mode
  if (process.env.NODE_DEV === "production") {
    accessTokenOptions.secure = true;
  }

  // Save the Access & Refresh Token to cookie
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // Send user & access token in response
  return res.json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
}
