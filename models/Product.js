// model: schema for product collection

import mongoose from 'mongoose';

// goal: create a schema for products
// i put a lot of validation here to make sure i dont have any bad data in my project.
// logic: i used map for the specs field because different gadgets have different specs (like cpu or battery life). this lets me store key-value pairs without changing the schema every time. i also added indexes on price and name to make future searches faster.
// FUTUREWORK: add references here and in readme later

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'], // validation: required check
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 chars']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be positive'] // validation: price cant be negative
    },
    category: {
        type: String,
        required: true,
        // validation: enum to ensure data consistency
        // this will also prevent typos like laptop-laptops. important for my filter logic later.
        enum: ['laptops', 'smartphones', 'audio', 'accessories', 'tablets']
    },
    description: {
        type: String,
        required: true,
        maxlength: [1000, 'Description is too long']
    },
    image: {
        type: String,
        default: 'IMAGE URL'
    },
    // adding stock to track how many items are left.
    stock: {
        type: Number,
        default: 0,
        min: 0
    },

    // dynamic specs logic
    // logic: the problem is how do i store specs because a laptop has CPU but a headphone has Battery.
    // so i decided to use a map here instead of a fixed object. i referred some examples on google.
    // this allows me to add different keys for different products
    // reference: https://mongoosejs.com/docs/schematypes.html#maps
    specs: {
        type: Map,
        of: String,
        default: {}
    },

    // timestamp for when it was created, will use it later for sorting by newest
    // FUTUREWORK: use the timestamp logic for sorting by newest 
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// index 1: indexing price for faster filtering/sorting in the shop
productSchema.index({ price: 1 });

// index 2: text index on name and description for search functionality
// i added text index here because i want to be able to search for products by name later.
productSchema.index({ name: 'text', description: 'text' });


export default mongoose.model('Product', productSchema);