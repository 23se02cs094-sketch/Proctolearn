const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const getApiOrigin = () => {
    if (!API_BASE_URL) return "";

    try {
        return new URL(API_BASE_URL).origin;
    } catch {
        return "";
    }
};

const API_ORIGIN = getApiOrigin();

export const PRODUCT_PLACEHOLDER = "/placeholder-product.svg";
export const CATEGORY_PLACEHOLDER = "/placeholder-category.svg";

export const isVideoUrl = (url = "") => {
    if (!url || typeof url !== "string") return false;

    const normalized = url.toLowerCase();
    return normalized.includes("/video/upload/") || /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(normalized);
};

export const getMediaType = (media) => {
    if (!media) return "image";

    if (media.resourceType === "video") return "video";
    if (isVideoUrl(media.url)) return "video";

    return "image";
};

export const resolveImageUrl = (url, fallback = PRODUCT_PLACEHOLDER) => {
    if (!url || typeof url !== "string") {
        return fallback;
    }

    if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) {
        return url;
    }

    // Legacy records may still point to /api/images/* paths that no longer exist.
    if (url.startsWith("/api/images/")) {
        return fallback;
    }

    if (url.startsWith("/")) {
        return API_ORIGIN ? `${API_ORIGIN}${url}` : url;
    }

    return API_ORIGIN ? `${API_ORIGIN}/${url}` : url;
};

export const handleImageError = (event, fallback = PRODUCT_PLACEHOLDER) => {
    if (!event?.currentTarget) return;

    const img = event.currentTarget;
    if (img.dataset.fallbackApplied === "true") return;

    img.dataset.fallbackApplied = "true";
    img.src = fallback;
};
