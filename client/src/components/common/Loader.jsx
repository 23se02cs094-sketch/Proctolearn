import React from "react";
import { Loader as LoaderIcon } from "lucide-react";

const Loader = ({ size = "default", fullScreen = false, text = "Loading..." }) => {
    const sizeClasses = {
        small: "h-5 w-5",
        default: "h-8 w-8",
        large: "h-12 w-12",
    };
    
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <LoaderIcon className={`${sizeClasses.large} text-purple-600 animate-spin`} />
                {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <LoaderIcon className={`${sizeClasses[size]} text-purple-600 animate-spin`} />
            {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
        </div>
    );
};

export default Loader;
