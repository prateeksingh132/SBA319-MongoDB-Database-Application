// Seeder

// goal: script to seed the database with initial data
// Important: i ahve to make sure that each collections have sample data (at least 5 per collection). also, i have to create the users first so i can grab their ids to use in the reviews later
// since dylan mentioned in class, i used the chatgpt to generate some sample data (5 each) based on schemas, which i have added here.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../database/conn.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // clearing existing data first
        // i want a fresh start every time i run this command
        await Product.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed in DB... starting fresh...');

        // creating users 
        // i have to create the users first so i can grab their ids to use in the reviews
        const createdUsers = await User.insertMany([
            { username: "AdminUser", email: "admin@gadgetshack.com", role: "admin" },
            { username: "TechFan99", email: "fan@test.com", role: "user" },
            { username: "AudioLover", email: "music@test.com", role: "user" },
            { username: "GamerPro", email: "gamer@test.com", role: "user" },
            { username: "OfficeWorker", email: "work@test.com", role: "user" }
        ]);

        // grabbing ids so i can link them later
        const admin = createdUsers[0]._id;
        const techFan = createdUsers[1]._id;
        const audioLover = createdUsers[2]._id;
        const gamerPro = createdUsers[3]._id;
        const officeWorker = createdUsers[4]._id;

        // creating products with specs
        // logic: i added the specs object here, where different objects have different keys.
        const sampleProducts = [
            {
                name: "Pro Gaming Laptop",
                price: 1299,
                category: "laptops",
                description: "High performance gaming laptop with RTX graphics.",
                stock: 10,
                image: "https://images.unsplash.com/photo-1603302576837-63f3ebee9b45?auto=format&fit=crop&q=80&w=600",
                specs: {
                    "CPU": "Intel i9",
                    "RAM": "32GB",
                    "GPU": "RTX 4080"
                }
            },
            {
                name: "Galaxy Ultra S24",
                price: 999,
                category: "smartphones",
                description: "Latest AI technology with 100x zoom.",
                stock: 25,
                image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=600",
                specs: {
                    "Screen": "6.8 inch OLED",
                    "Battery": "5000mAh",
                    "Camera": "200MP"
                }
            },
            {
                name: "Noise Cancel Headphones",
                price: 199,
                category: "audio",
                description: "Premium wireless headphones.",
                stock: 50,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
                specs: {
                    "Type": "Over-ear",
                    "Battery Life": "30 Hours",
                    "ANC": "Yes"
                }
            },
            {
                name: "Mechanical Keyboard",
                price: 89,
                category: "accessories",
                description: "Clicky switches for the best typing experience.",
                stock: 100,
                image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?auto=format&fit=crop&q=80&w=600",
                specs: {
                    "Switch": "Cherry MX Blue",
                    "Backlight": "RGB"
                }
            },
            {
                name: "4K Monitor",
                price: 350,
                category: "accessories",
                description: "Ultra HD display for crystal clear work and gaming.",
                stock: 15,
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600",
                specs: {
                    "Resolution": "3840 x 2160",
                    "Refresh Rate": "144Hz"
                }
            }
        ];

        const createdProducts = await Product.insertMany(sampleProducts);

        // creating reviews
        // FUTUREWORK: make sure the linking works properly, check in compass
        await Review.create([
            {
                rating: 5,
                text: "Best laptop I have ever owned!",
                product: createdProducts[0]._id, // linking to laptop
                user: admin // linking to admin
            },
            {
                rating: 4,
                text: "Great sound quality but expensive.",
                product: createdProducts[2]._id, // linking to headphones
                user: techFan // linking to techfan
            },
            {
                rating: 5,
                text: "The mechanical keys feel amazing.",
                product: createdProducts[3]._id, // linking to keyboard
                user: officeWorker // linking to officeworker
            },
            {
                rating: 3,
                text: "Good monitor but the stand is wobbly.",
                product: createdProducts[4]._id, // linking to monitor
                user: gamerPro // linking to gamerpro
            },
            {
                rating: 5,
                text: "The camera on this phone is insane!",
                product: createdProducts[1]._id, // linking to phone
                user: audioLover // linking to audiolover
            }
        ]);

        console.log('Data Imported Successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();