import axios from "axios";

// Cloudinary configuration from environment
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwriugkmb";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

const PRESET_FALLBACKS = ["ml_default"];

const getCandidatePresets = () => {
    return [...new Set([CLOUDINARY_UPLOAD_PRESET, ...PRESET_FALLBACKS].filter(Boolean))];
};

const isPresetError = (error) => {
    const message = error?.response?.data?.error?.message || error?.message || "";
    return /preset/i.test(String(message));
};

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{public_id: string, url: string}>}
 */
export const uploadImageToCloudinary = async (file, onProgress = null) => {
    const presets = getCandidatePresets();

    if (presets.length === 0) {
        throw new Error("Cloudinary upload preset is not configured");
    }

    let lastError;

    for (let i = 0; i < presets.length; i++) {
        const preset = presets[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", preset);
        formData.append("folder", "products");

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
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
                resourceType: response.data.resource_type,
                format: response.data.format,
            };
        } catch (error) {
            lastError = error;

            const canRetry = i < presets.length - 1 && isPresetError(error);
            if (!canRetry) {
                throw error;
            }
        }
    }

    throw lastError || new Error("Cloudinary upload failed");
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
