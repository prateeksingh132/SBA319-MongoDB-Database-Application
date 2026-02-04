// model: schema for user collection

import mongoose from 'mongoose';

// goal: create user schema
// i need users so i can link reviews to them later.

const userSchema = new mongoose.Schema({});


export default mongoose.model('User', userSchema);