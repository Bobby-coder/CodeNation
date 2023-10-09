import { app } from "./app";
import { connectDB } from "./config/db";
const dotenv = require("dotenv")

// Load env variables
dotenv.config()

// Start listening to app
app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
  connectDB()
});
