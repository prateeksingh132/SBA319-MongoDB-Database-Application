// model: schema for review collection

import mongoose from 'mongoose';

// goal: i wanna create reviews that link users to products.
// logic: the idea is that this schema will link the user collection and product collection.
// https://stackoverflow.com/questions/25214624/how-to-define-a-foreign-key-using-mongoose, 
// similar to the example in the link, i used mongoose.Schema.ObjectId and ref to link a review to a specific product and user. 
// i also added a compound index at the bottom so a user cant add more reviews on the same product

// i will test it later once i create the seed script as it require valid ids from user and product collection.
// FUTUREWORK: test it after creating seeder script. make sure the linking works, check in compass
// FUTUREWORK: add references here and in readme later

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },

    // IMPORTANT: relationship --> linking to product
    // the idea is to creates a foreign key style relationship in mongo.
    // i checked this example: https://stackoverflow.com/questions/25214624/how-to-define-a-foreign-key-using-mongoose
    // similar to the example in the link, i used mongoose.Schema.ObjectId and ref to link a review to a specific product and user. 
    // another link i checked: https://mongoosejs.com/docs/populate.html . 
    // REMEMBER: check out this link leter if you wanna expand on this funtionality later on. 
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },

    // IMPORTANT: relationship --> linking to user
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// the issue is that a user can add review on same product multiple times, so i have to prevent this-- validation
// logic: i wanna create a compound index on user and product with the unique option. it ensures a user cant review the same product twice.
// reference: https://www.mongodb.com/docs/manual/core/index-unique/#unique-compound-index
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;