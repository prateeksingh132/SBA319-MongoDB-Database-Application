//////// product controller

//////// GadgetShack product controller

// goal: this file handles the logic for product routes.
// i separated this from the routes file to keep my code organized (modularization).

import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';


// get all products (with filtering and dashboard stats)
// Note: i am gonna temporarily use res.json so i can verify the data works in the browser without the view engine. i will change it to res.render later 
// logic: i have used aggregation pipeline, used $group and $multiply to calculate the total inventory value directly in the database. similar to sba 318, i also added logic to fetch products, users, and reviews so i have everything needed for the dashboard. sending json for now to test

export const getAllProducts = async (req, res, next) => {

    try {
        const categoryQuery = req.query.category;

        // fetching products from db
        // logic: building the mongoose query based on url params
        let query = Product.find();
        if (categoryQuery) {
            query = query.where('category').equals(categoryQuery);
        }
        // sorting so newest items show first
        query = query.sort('-createdAt');
        const products = await query;


        ////////////TESTING
        // console.log("TESTING: products:", products);
        ////////////


        // fetching related data
        // i need users and reviews to display on the page
        const users = await User.find();
        // populate() is crucial here. 
        // logic: the idea is thtat this will replaces the stored user id with the actual user object so i can get the username.
        const reviews = await Review.find().populate('user').populate('product');

        // calculating total inventory value
        // logic: i am gonna use mongoose aggregation pipeline to calculate stats on the server side.
        const valueStats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    // multiply price * stock for each item, then sum them all up
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    totalItems: { $sum: "$stock" }
                }
            }
        ]);

        // calculating which category has the most items
        const catStats = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }, // sort descending
            { $limit: 1 } // this will just get me the top one
        ]);

        // i m doing a safety check here in case db is empty so code doesnt crash - validation
        const totalVal = valueStats.length > 0 ? valueStats[0].totalValue : 0;
        const topCat = catStats.length > 0 ? catStats[0]._id : "N/A";

        ////////////TESTING
        // TEMPORARY: sending json to test if logic works before building the view
        // i will replace this with res.render later
        // res.json({
        //     dashboard: { totalVal, topCat },
        //     productsCount: products.length,
        //     reviewsCount: reviews.length,
        //     usersCount: users.length
        // });
        ////////////TESTING


        // Goal: creating html string to send to the view engine
        let html = ``;

        // building my dashboard
        html += `
            <div class="dashboard-banner">
                <div class="stat-box">
                    <h3>Inventory Value</h3>
                    <h1>$${totalVal.toLocaleString()}</h1>
                </div>
                <div class="stat-box">
                    <h3>Top Category</h3>
                    <h1 class="stat-highlight" style="text-transform: uppercase;">${topCat}</h1>
                </div>
                <div class="stat-box">
                    <h3>Total Products</h3>
                    <h1>${products.length}</h1>
                </div>
            </div>
            
            <div class="product-cards-div">
        `;

        // product cards
        for (let p of products) {

            // logic to render the specs map into a list
            let specsHtml = '<ul class="specs-list">';
            if (p.specs) {
                for (let [key, val] of p.specs) {
                    specsHtml += `<li><span class="specs-key">${key}:</span> ${val}</li>`;
                }
            }
            specsHtml += '</ul>';

            html += `
                <div class="card">
                    <h3>${p.name}</h3>
                    <div class="itemImage">
                        <img src="${p.image}" alt="${p.name}" style="max-height: 100%; max-width: 100%;">
                    </div>
                    
                    <p class="price">$${p.price}</p>
                    <span class="category">${p.category}</span>
                    
                    ${specsHtml} 
                    
                    <p class="stock">Stock: ${p.stock}</p>
                    <p class="card-description">${p.description}</p>
                    
                    <div class="action-buttons">
                        <form action="/products/${p._id}?_method=DELETE" method="POST" style="margin:0;">
                            <button type="submit" class="delete-btn">Delete</button>
                        </form>
                        <a href="/products/${p._id}/edit" class="edit-link">Edit</a>
                    </div>
                </div>
            `;
        }
        html += `</div>`;


        // user list section (i updated it to link to profile)
        html += `
            <div class="extra-data-container">
                <h2>Community Members</h2>
                <ul class="data-list">
        `;
        for (let u of users) {
            // linking to user profile page
            // idea is that when i click the name, it should take me to their specific profile page
            html += `<li><a href="/products/user/${u._id}" style="color: #003366; font-weight: bold;">${u.username}</a> (${u.role})</li>`;
        }
        html += `</ul></div>`;


        // adding product form here
        // similar to sba 318
        html += `
            <div class="form-container">
                <h2>Add New Gadget</h2>
                <form action="/products" method="POST">
                    <input type="text" name="name" placeholder="Name" required>
                    <input type="number" name="price" placeholder="Price" required>
                    
                    <select name="category">
                        <option value="laptops">Laptops</option>
                        <option value="smartphones">Smartphones</option>
                        <option value="audio">Audio</option>
                        <option value="tablets">Tablets</option>
                        <option value="accessories">Accessories</option>
                    </select>
                    
                    <input type="number" name="stock" placeholder="Stock Qty">
                    <input type="text" name="image" placeholder="Image URL">
                    <textarea name="description" placeholder="Description"></textarea>
                    
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">Specs (Format: JSON string like {"CPU":"M1"})</p>
                    <input type="text" name="specs" placeholder='{"CPU": "M1", "RAM": "16GB"}'>

                    <button type="submit" style="background-color: #003366; color: white; width: 100%; padding: 12px; font-size: 1rem;">Add to Database</button>
                </form>
            </div>
        `;

        res.render("index", { title: "Admin Dashboard", content: html });



    } catch (err) {
        next(err);
    }
};


// create product
// FUTUREWORK: test it after creating router
export const createProduct = async (req, res, next) => {
    try {
        // logic: mongoose .create() validates data against schema automatically
        await Product.create(req.body);
        // redirecting back to shop after creation
        res.redirect('/products');
    } catch (err) {
        // if validation fails, error middleware handles it
        next(err);
    }
};



// Goal: display all reviews written by a specific user.
// user profile logic: i am gonna create a user profile controller that fetches a users specific reviews. i will find all reviews where the user matches the url id.
// FUTUREWORK: test it after creating router
export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // finding user details
        const user = await User.findById(userId);
        if (!user) return res.send("User not found");

        // finding reviews by this user and populating the product info
        // i need populate('product') so i can show the name of the item they reviewed
        const userReviews = await Review.find({ user: userId }).populate('product');

        ////////////TESTING
        // TEMPORARY: sending json to test
        // res.json({ user, userReviews });
        ////////////TESTING


        // creating html string for users profile to send to the view engine
        let profileHtml = `
            <div class="profile-container">
                <h1 class="profile-header">${user.username}'s Profile</h1>
                
                <div class="profile-details">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> <span style="text-transform: capitalize;">${user.role}</span></p>
                    <p><strong>Member Since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <h2 style="margin-top: 30px; color: #003366;">Reviews Written (${userReviews.length})</h2>
                <div class="reviews-list">
        `;

        if (userReviews.length === 0) {
            profileHtml += `<p>This user hasn't written any reviews yet.</p>`;
        } else {
            for (let r of userReviews) {
                profileHtml += `
                    <div class="review-card">
                        <h3 style="margin: 0; color: #333;">${r.product.name}</h3>
                        <p class="review-rating">Rating: ${r.rating}/5</p>
                        <p style="font-style: italic; color: #555;">"${r.text}"</p>
                        <small style="color: #999;">Posted on: ${new Date(r.createdAt).toLocaleDateString()}</small>
                    </div>
                `;
            }
        }

        // added the profile-back-btn class styling in css
        profileHtml += `
                </div>
                <a href="/products" class="profile-back-btn">Back to Dashboard</a>
            </div>
        `;

        res.render("index", { title: `${user.username}'s Profile`, content: profileHtml });



    } catch (err) {
        next(err);
    }
};

// delete product
// FUTUREWORK: test it after creating router
export const deleteProduct = async (req, res, next) => {
    try {
        // using mongoose method
        await Product.findByIdAndDelete(req.params.id);

        ////////////TESTING
        // console.log(`TESTING: Deleted ${req.params.id}`);
        ////////////

        res.redirect('/products');

    } catch (err) {
        next(err);
    }
};

// show edit form
// Goal: similar to sba 318, i am gonna create an edit button in each product card. when i clicks edit,the server has to find the item and it shows a form filled with the old data
// and then i can update and when i clicks updtae button, the server has to find the item again, overwrite the old data with new data, and save it
// FUTUREWORK: test it after creating router
export const showEditForm = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.send("Not Found");

        ////////////TESTING
        // TEMPORARY
        //res.send(`Edit Form for ${product.name}`);
        ////////////TESTING


        let formHtml = `
            <div class="form-container">
                <h2>Edit ${product.name}</h2>
                <form action="/products/${product._id}?_method=PATCH" method="POST">
                    <label>Name</label>
                    <input type="text" name="name" value="${product.name}">
                    <label>Price</label>
                    <input type="number" name="price" value="${product.price}">
                    <label>Stock</label>
                    <input type="number" name="stock" value="${product.stock}">
                    <label>Description</label>
                    <textarea name="description">${product.description}</textarea>
                    <button type="submit">Update</button>
                </form>
                <a href="/products">Cancel</a>
            </div>
        `;

        res.render("index", { title: "Edit", content: formHtml });

    } catch (err) {
        next(err);
    }
};

// update product
// FUTUREWORK: test it after creating router
export const updateProduct = async (req, res, next) => {
    try {
        // logic: finding by id and updating.
        // IMPORTANT: runValidators: true is important so that it checks enum and required fields again
        await Product.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
        res.redirect('/products');

    } catch (err) {
        next(err);
    }
};