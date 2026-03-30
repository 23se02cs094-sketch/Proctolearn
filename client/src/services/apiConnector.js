import axios from "axios";

// Create axios instance with base configuration
export const axiosInstance = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://proctolearn-ten.vercel.app/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific error codes
            if (error.response.status === 401) {
                // Token expired or invalid - clear storage and redirect
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                // Don't redirect if already on auth pages
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/signup')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// API Connector function for making requests
export const apiConnector = async (method, url, bodyData = null, headers = null, params = null) => {
    try {
        // Determine if bodyData is FormData
        const isFormData = bodyData instanceof FormData;
        
        // For FormData uploads, use plain axios instead of axiosInstance to avoid header conflicts
        if (isFormData) {
            const token = localStorage.getItem("token");
            const response = await axios({
                method: method,
                url: url,
                data: bodyData,
                withCredentials: true,
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                    // Don't set Content-Type - let axios handle multipart/form-data with boundary
                },
                params: params,
            });
            return response;
        }
        
        // For regular JSON requests, use axiosInstance
        const requestConfig = {
            method: method,
            url: url,
            headers: headers || {},
            params: params,
        };

        if (bodyData !== null && bodyData !== undefined) {
            requestConfig.data = bodyData;
        }

        const response = await axiosInstance(requestConfig);
        return response;
    } catch (error) {
        throw error;
    }
};

export default apiConnector;
