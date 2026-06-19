import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const adminEmail = 'admin@ayurlife.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin already exists.');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        console.log('Admin User Created Successfully!');
        console.log('Email: admin@ayurlife.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
