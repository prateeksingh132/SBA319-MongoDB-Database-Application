// model: schema for user collection

import mongoose from 'mongoose';

// goal: create user schema
// i need users so i can link reviews to them later.
// FUTUREWORK: add references here and in readme later

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true, // validation: unique username so no duplicates
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // validation: simple regex for email format
        // i found this regex on stackoverflow to validate emails, works pretty good
        // reference: https://stackoverflow.com/questions/18022365/mongoose-validate-email-syntax
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // validation: only these two roles allowed
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});


export default mongoose.model('User', userSchema);