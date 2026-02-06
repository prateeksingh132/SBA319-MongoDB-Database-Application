////////////////////// SBA 319: MongoDB Database Application //////////////////////

////////////////////////////////////////// Imports
import express from "express";
import dotenv from "dotenv";


///////// Import Logging Middleware
import { logReq } from "./middleware/logger.js";

///////// Import Error Handling Middleware
import { globalErr, error404 } from "./middleware/error.js";

///////// Import routes
import productRoutes from "./routes/productRoutes.js";

///////// Import file handler
import fs from "fs";

//////// Import Database
import connectDB from "./database/conn.js"; // DB connection

// i need method-override to use PUT and DELETE in html forms, (similar to sba 318)
import methodOverride from "method-override";


////////////////////////////////////////// Setups
// load env vars from .env file
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// connect database
connectDB();


//////////////////////////////////////// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// logging middleware
app.use(logReq);



//////////////////////////////////////// View Engine 


//////////////////////////////////////// Routes
//////////////////////////////////////// 
// connecting the product routes. any url starting with /products goes here.
app.use("/products", productRoutes);

// home page route
app.get("/", (req, res) => {
    res.send("GadgetShack with DB Connected.....");
});


////////////TESTING
//app.get('/test_controller', getAllProducts);
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