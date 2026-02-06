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
        res.json({
            dashboard: { totalVal, topCat },
            productsCount: products.length,
            reviewsCount: reviews.length,
            usersCount: users.length
        });
        ////////////TESTING


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


// user profile logic: i am gonna create a user profile controller that fetches a users specific reviews
// Goal: display all reviews written by a specific user.
// logic: finding all reviews where the user matches the url id.
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
        res.json({ user, userReviews });
        ////////////TESTING


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
        res.send(`Edit Form for ${product.name}`);
        ////////////TESTING

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