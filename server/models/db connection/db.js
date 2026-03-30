const mongoose = require('mongoose');
const dns = require('dns');

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

const connectWithUri = async (uri) => {
    return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
    });
};

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('MONGODB_URI is missing in environment variables');
        }

        let conn;

        try {
            conn = await connectWithUri(mongoUri);
        } catch (error) {
            if (mongoUri.startsWith('mongodb+srv://') && isSrvDnsRefusedError(error)) {
                const dnsServers = getDnsServers();
                dns.setServers(dnsServers);
                console.log(`⚠️ Retrying MongoDB with custom DNS servers: ${dnsServers.join(', ')}`);
                conn = await connectWithUri(mongoUri);
            } else {
                throw error;
            }
        }

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
