import { Redis } from "ioredis";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

// Function to connect with redis
function redisClient() {
  if (process.env.REDIS_URL) {
    console.log("Redis connected");
    return process.env.REDIS_URL;
  }
  throw new Error("Redis connection failed");
}

export const redis = new Redis(redisClient());
