const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    phone: String,
    role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Admin credentials - CHANGE THESE!
        const adminData = {
            name: 'Admin',
            email: '23se02cs094@ppsu.ac.in',
            password: '123456',
            phone: '9999999999',
            role: 'admin',
            isVerified: true
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('\n========================================');
            console.log('Admin user already exists!');
            console.log('Email:', adminData.email);
            console.log('========================================\n');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const admin = await User.create(adminData);

        console.log('\n========================================');
        console.log('Admin user created successfully!');
        console.log('========================================');
        console.log('Email:', adminData.email);
        console.log('Password: (the one you set)');
        console.log('========================================');
        console.log('Login at: http://localhost:5173/admin');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
