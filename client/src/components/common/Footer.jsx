import React from "react";
import { Link } from "react-router-dom";
import {
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    Send,
} from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    const quickLinks = [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: "Categories", path: "/categories" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];
    
    const customerService = [
        { name: "My Account", path: "/profile" },
        { name: "Track Order", path: "/orders" },
        { name: "Wishlist", path: "/wishlist" },
        { name: "Shipping Info", path: "/shipping-info" },
        { name: "Returns & Refunds", path: "/returns" },
    ];
    
    const policies = [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Refund Policy", path: "/refund-policy" },
        { name: "FAQ", path: "/faq" },
    ];
    
    const socialLinks = [
        { icon: Instagram, href: "https://www.instagram.com/resin_art_190?igsh=anA1emt1MjRpNzhz", label: "Instagram" },
        { icon: Youtube, href: "#", label: "YouTube" },
    ];
    
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white">
                                Subscribe to Our Newsletter
                            </h3>
                            <p className="text-white/80 mt-1">
                                Get updates on new products and exclusive offers!
                            </p>
                        </div>
                        <form className="flex w-full md:w-auto max-w-md gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">The Resin World</h2>
                        <p className="text-gray-400 text-sm">
                            Discover unique handcrafted resin products for your home, kitchen, and jewelry collection. Each piece is made with love and attention to detail.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors"
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            {customerService.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400 text-sm">
                                    54,aksharsham socity ,near hathi mandir road ,
                                    <br />
                                    katargam,surat
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                <a href="tel:9023972308" className="text-gray-400 hover:text-purple-400 text-sm">
                                    9023972308
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                <a href="mailto:info@theresinworld.com" className="text-gray-400 hover:text-purple-400 text-sm">
                                    info@theresinworld.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm text-center md:text-left">
                            © {currentYear} The Resin World. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {policies.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-gray-500 hover:text-purple-400 transition-colors text-sm"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
