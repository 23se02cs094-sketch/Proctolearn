import axios from "axios";

// Cloudinary configuration from environment
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwriugkmb";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "the-resin-world";

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{public_id: string, url: string}>}
 */
export const uploadImageToCloudinary = async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "products");
    
    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        }
    );
    
    return {
        public_id: response.data.public_id,
        url: response.data.secure_url,
    };
};

/**
 * Upload multiple images to Cloudinary in parallel
 * @param {File[]} files - Array of files to upload
 * @param {Function} onProgress - Progress callback (receives overall progress)
 * @returns {Promise<Array<{public_id: string, url: string}>>}
 */
export const uploadMultipleImages = async (files, onProgress = null) => {
    const totalFiles = files.length;
    let completedFiles = 0;
    
    const uploadPromises = files.map(async (file) => {
        const result = await uploadImageToCloudinary(file);
        completedFiles++;
        if (onProgress) {
            onProgress(Math.round((completedFiles / totalFiles) * 100));
        }
        return result;
    });
    
    return Promise.all(uploadPromises);
};
