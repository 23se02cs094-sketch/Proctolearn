const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DEFAULT_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const getDnsServers = () => {
    const fromEnv = (process.env.DNS_SERVERS || '')
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean);

    return fromEnv.length ? fromEnv : DEFAULT_DNS_SERVERS;
};

const isSrvDnsRefusedError = (error) => {
    return Boolean(
        error &&
        error.code === 'ECONNREFUSED' &&
        typeof error.message === 'string' &&
        error.message.includes('querySrv')
    );
};

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
        try {
            await mongoose.connect(process.env.MONGODB_URI);
        } catch (error) {
            if (isSrvDnsRefusedError(error)) {
                const dnsServers = getDnsServers();
                dns.setServers(dnsServers);
                console.log(`Retrying MongoDB with custom DNS servers: ${dnsServers.join(', ')}`);
                await mongoose.connect(process.env.MONGODB_URI);
            } else {
                throw error;
            }
        }
        console.log('Connected to MongoDB');

        // Admin credentials - CHANGE THESE!
        const adminData = {
            name: 'Admin',
            email: 'snehasaspara19@gmail.com',
            password: 'sneha19',
            phone: '9999999999',
            role: 'admin',
            isVerified: true
        };

        // Check if user already exists and promote/update to admin.
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);

            await User.updateOne(
                { _id: existingAdmin._id },
                {
                    $set: {
                        name: adminData.name,
                        password: hashedPassword,
                        phone: adminData.phone,
                        role: 'admin',
                        isVerified: true
                    }
                }
            );

            console.log('\n========================================');
            console.log('Admin user already exists and was updated!');
            console.log('Email:', adminData.email);
            console.log('Role set to: admin');
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
