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
// reusing my logic from sba 318. this simple engine replaces #title# and #content# placeholders.
app.engine("html", function (filePath, options, cb) {
    fs.readFile(filePath, (err, content) => {
        if (err) return cb(err);
        let rendered = content.toString();
        if (options.title) rendered = rendered.replace("#title#", options.title);
        if (options.content) rendered = rendered.replace("#content#", options.content);
        return cb(null, rendered);
    });
});
app.set("views", "./views");
app.set("view engine", "html");
app.use(express.static("./styles")); // serve static files from the styles directory
app.use(express.static("./images")); // serve static files from the images directory

//////////////////////////////////////// Routes
//////////////////////////////////////// 
// connecting the product routes. any url starting with /products goes here.
app.use("/products", productRoutes);

// home page route
app.get("/", (req, res) => {
    //res.send("GadgetShack with DB Connected.....");

    // using the view engine now
    let homeHtml = `
        <div class="hero-container">
            <div class="hero">
                <h1>Welcome to GadgetShack</h1>
                <p>Powered by MongoDB & Mongoose</p>
                
                <div class="status-box">
                    <span>&#9679;</span> Database Connected Successfully...
                </div>
                <br>
                <a href="/products" class="shop-btn">Enter Shop</a>
            </div>
        </div>
    `;

    res.render("index", { title: "Home", content: homeHtml });

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