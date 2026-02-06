/////// API logic: All routes logic for gadgetshack page


import express from "express";
const router = express.Router();

import {
    getAllProducts,
    createProduct,
    deleteProduct,
    showEditForm,
    updateProduct,
    getUserProfile
} from "../controller/productController.js";

// i am gonna utilize my router.param validation logic from sba 318 here
// however, mongodb ids are 24-char hex strings. 
// my regex below checks if the id is valid hex before even trying to query the database.
// this will prevents mongoose casterror crashes. 
// reference: https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
router.param('id', (req, res, next, id) => {
    // regex: start of line, 0-9 or a-f, exactly 24 chars, end of line
    const hexRegex = /^[0-9a-fA-F]{24}$/;

    if (!hexRegex.test(id)) {
        const err = new Error("Invalid MongoDB ID Format");
        err.status = 400;
        return next(err);
    }
    next();
});

// route definitions
router.get("/", getAllProducts);
router.post("/", createProduct);

// route for user profile
// logic: putting this before /:id so user isnt treated as an id
router.get("/user/:userId", getUserProfile);

router.get("/:id/edit", showEditForm);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;