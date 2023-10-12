import { app } from "./app";
import { cloudinaryConfig } from "./config/cloudinary";
import { connectDB } from "./config/db";
const dotenv = require("dotenv");
import { v2 as cloudinary } from "cloudinary";

// Load env variables
dotenv.config();

// config cloudinary
cloudinaryConfig();

// Start listening to app
app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
  connectDB();
});
