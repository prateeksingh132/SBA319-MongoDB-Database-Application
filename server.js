////////////////////// SBA 319: MongoDB Database Application //////////////////////

////////////////////////////////////////// Imports
import express from "express";
import dotenv from "dotenv";


///////// Import Logging Middleware
import { logReq } from "./middleware/logger.js";

///////// Import Error Handling Middleware


///////// Import routes


///////// Import file handler


//////// Import Database
import connectDB from "./database/conn.js"; // DB connection



////////////////////////////////////////// Setups
// load env vars from .env file
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// connect database
connectDB();


//////////////////////////////////////// Middleware
// logging middleware
app.use(logReq);



//////////////////////////////////////// View Engine 


//////////////////////////////////////// Routes

////////////TESTING
// app.get("/", (req, res) => {
//   res.send("testing read!");
// });
////////////TESTING



//////////////////////////////////////// Error Handling


////////////////////////////////////////// Listener
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});