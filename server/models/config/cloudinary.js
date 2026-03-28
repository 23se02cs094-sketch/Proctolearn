
const cloudinary = require('cloudinary').v2;

// Log config on load to debug
console.log('=== Cloudinary Config Loading ===');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

// Validate credentials exist
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('ERROR: Missing Cloudinary credentials! Check your .env file.');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Test Cloudinary connection
const printCloudinaryErrorHint = (error) => {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    if (errorCode === 'ENOTFOUND' || errorCode === 'EAI_AGAIN' || /ENOTFOUND|EAI_AGAIN/i.test(errorMessage)) {
        console.error('DNS/Network issue: Unable to resolve api.cloudinary.com from this machine.');
        console.error('Check internet/VPN/firewall/DNS settings and try again.');
        return;
    }

    if (error?.http_code === 401) {
        console.error('Authentication issue: Cloudinary API credentials are invalid.');
        console.error('Verify API key/secret at: https://console.cloudinary.com/settings/api-keys');
        return;
    }

    console.error('Cloudinary request failed. Verify credentials and network access.');
};

const testCloudinaryConnection = async (attempt = 1) => {
    try {
        await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful!');
        return true;
    } catch (error) {
        console.error(`❌ Cloudinary connection FAILED (attempt ${attempt}):`, error.message);
        printCloudinaryErrorHint(error);

        if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return testCloudinaryConnection(attempt + 1);
        }

        return false;
    }
};

// Call test on startup
testCloudinaryConnection();

const uploadToCloudinary = async (file, folder = 'products') => {
    if (!file) {
        throw new Error('No file provided for upload');
    }

    console.log('uploadToCloudinary called with file:', file.name, 'tempFilePath:', file.tempFilePath);
    const filePath = file.tempFilePath || file;
    console.log('Using filePath:', filePath);

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto'
        });
        console.log('✅ Upload successful:', result.public_id);
        return result;
    } catch (error) {
        console.error('❌ Cloudinary upload error:', error.message);
        printCloudinaryErrorHint(error);
        throw error;
    }
};

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        throw new Error('No public ID provided for deletion');
    }

    return cloudinary.uploader.destroy(publicId);
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
    deleteFromCloudinary
};
