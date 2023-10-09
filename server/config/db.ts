import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const dbUri: string = process.env.DB_URI || "";

export async function connectDB() {
  try {
    const data = await mongoose.connect(dbUri);
    console.log(`Database connected with ${data.connection.host}`);
  } catch (err: any) {
    console.log(err);
    // Reconnect after 5 seconds
    setTimeout(connectDB, 5000);
  }
}
