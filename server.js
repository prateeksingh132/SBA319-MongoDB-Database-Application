////////////////////// SBA 319: MongoDB Database Application //////////////////////

////////////////////////////////////////// Imports
import express from "express";
import dotenv from "dotenv";


///////// Import Logging Middleware
import { logReq } from "./middleware/logger.js";

///////// Import Error Handling Middleware
import { globalErr, error404 } from "./middleware/error.js";

//////// Import Controller
import { getAllProducts } from "./controller/productController.js";

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
app.get('/test_controller', getAllProducts);
////////////TESTING


////////////TESTING
// app.get("/", (req, res) => {
//   res.send("testing read!");
// });
////////////TESTING



//////////////////////////////////////// Error Handling
////////////////////////////////////////
// this has to be at the end, after all routes

// 404 Handler - Custom middleware -- used from sba 318
// this will run when no route above matches the url
app.use(error404);

// Global error handler: this will catch any errors passed from error404 or other routes
app.use(globalErr);



////////////////////////////////////////// Listener
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});