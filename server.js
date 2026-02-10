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
// Middleware for method-override - similar logic from sba 318
// https://stackoverflow.com/questions/72611507/form-delete-method-is-redirecting-to-the-get-method-instead-in-express-js
// https://dev.to/moz5691/method-override-for-put-and-delete-in-html-3fp2
app.use(methodOverride('_method'));

// logging middleware
app.use(logReq);



//////////////////////////////////////// View Engine 
// reusing my logic from sba 318. 
// logic: creating a view engine to read .html files. this simple engine replaces #title# and #content# placeholders.
app.engine("html", function (filePath, options, cb) {
    fs.readFile(filePath, (err, content) => {
        if (err) return cb(err);

        // i am converting the content to string so i can replace text
        let rendered = content.toString();

        // replacing #title# and #content# placeholders in my html
        // checking if options have title or content passed from the route
        if (options.title) rendered = rendered.replace("#title#", options.title);
        if (options.content) rendered = rendered.replace("#content#", options.content);

        // return the final html string
        return cb(null, rendered);
    });
});

// View Engine setup
app.set("views", "./views");
app.set("view engine", "html");
app.use(express.static("./styles")); // serve static files from the styles directory
app.use(express.static("./images")); // serve static files from the images directory

//////////////////////////////////////// Routes
//////////////////////////////////////// 
// logic: i am keeping the same theme consistent with previous sbas, a homepage and a link to a product page (shop page)
// product page route of my view.
app.use("/products", productRoutes);

// homepage route of my view
// creating the base route for my homepage here. it has link to the products page
// i am creating my homepage html content here dynamically to inject into my view (index.html)
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