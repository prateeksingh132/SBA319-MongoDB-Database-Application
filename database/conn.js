// DB connection: conn.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionStr = process.env.MONGO_URI || "";

async function connectDB() {
    try {
        await mongoose.connect(connectionStr);

        console.log(`MongoDB Connected Successfully...`)
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

export default connectDB;