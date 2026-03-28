import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Brush,
    CheckCircle2,
    Gem,
    HeartHandshake,
    Leaf,
    PackageCheck,
    Palette,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";

const stats = [
    { label: "Happy Customers", value: "12,000+" },
    { label: "Handcrafted Designs", value: "450+" },
    { label: "Cities Delivered", value: "120+" },
    { label: "Average Rating", value: "4.8/5" },
];

const values = [
    {
        title: "Craftsmanship First",
        description:
            "Every product is made in small batches with strict quality checks and artisan-level finishing.",
        icon: Brush,
    },
    {
        title: "Original Designs",
        description:
            "We build color palettes, forms, and textures in-house so your pieces feel personal and one of a kind.",
        icon: Palette,
    },
    {
        title: "Premium Materials",
        description:
            "Food-safe resin, durable pigments, and tested packaging ensure beauty and long-lasting performance.",
        icon: Gem,
    },
    {
        title: "Customer Care",
        description:
            "From product selection to delivery support, our team stays connected with fast and friendly help.",
        icon: HeartHandshake,
    },
];

const process = [
    {
        title: "Design Blueprint",
        description: "We map shape, tone, and function before pouring begins.",
    },
    {
        title: "Hand Pouring",
        description: "Artisans layer resin carefully for depth, clarity, and character.",
    },
    {
        title: "Cure and Finish",
        description: "Pieces are cured, polished, and inspected for strength and shine.",
    },
    {
        title: "Safe Dispatch",
        description: "Products are packed with impact-safe materials and shipped quickly.",
    },
];

const qualityPoints = [
    "Food-safe and skin-friendly materials for relevant categories",
    "Multiple durability and finish checks before shipping",
    "Protective packaging to reduce transit damage",
    "Simple support for replacement and order-related issues",
];

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white pt-28 sm:pt-32 pb-16 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.25),transparent_40%)]" />
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm">
                                <Sparkles className="h-4 w-4" />
                                About The Resin World
                            </span>
                            <h1 className="mt-6 text-4xl sm:text-5xl font-bold leading-tight">
                                Resin art made with purpose, precision, and personality.
                            </h1>
                            <p className="mt-5 text-base sm:text-lg text-purple-100 leading-relaxed max-w-xl">
                                The Resin World started with one idea: everyday essentials can be functional and beautiful at the same time. We craft statement pieces for homes, gifting, and personal style using modern resin techniques and handcrafted detail.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300"
                                >
                                    Explore Products
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    to="/categories"
                                    className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
                                >
                                    Browse Categories
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-5">
                            {stats.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-5"
                                >
                                    <p className="text-2xl sm:text-3xl font-bold">{item.value}</p>
                                    <p className="mt-2 text-sm text-purple-100">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Story</h2>
                            <p className="mt-5 text-gray-600 leading-relaxed">
                                What began as a small studio experiment grew into a design-led craft brand trusted by customers across India. From custom trays to elegant jewelry and decor, every collection is developed to blend durability with visual impact.
                            </p>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                We collaborate with skilled makers, test each finish, and keep improving our methods so that each order feels special from unboxing to everyday use.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-8 sm:p-10">
                            <h3 className="text-xl font-semibold text-gray-900">What We Create</h3>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <PackageCheck className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <p className="text-gray-700">Kitchen and serveware items designed for daily use and gifting.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Leaf className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <p className="text-gray-700">Home decor accents that bring color and texture to modern spaces.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <p className="text-gray-700">Jewelry and lifestyle pieces made with comfort, style, and quality in mind.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Core Values</h2>
                        <p className="mt-3 text-gray-600">
                            The principles that guide every collection, process, and customer experience.
                        </p>
                    </div>
                    <div className="mt-10 grid sm:grid-cols-2 gap-6">
                        {values.map((value) => (
                            <article
                                key={value.title}
                                className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <value.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.title}</h3>
                                <p className="mt-2 text-gray-600 leading-relaxed">{value.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How We Make It</h2>
                            <p className="mt-4 text-gray-600">
                                Our production process combines creative detail with dependable quality controls.
                            </p>
                            <div className="mt-8 space-y-5">
                                {process.map((step, index) => (
                                    <div key={step.title} className="flex gap-4">
                                        <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                                            <p className="text-gray-600 mt-1">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 sm:p-10">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <h3 className="text-2xl font-bold text-gray-900">Quality Promise</h3>
                            </div>
                            <ul className="mt-6 space-y-4">
                                {qualityPoints.map((point) => (
                                    <li key={point} className="flex items-start gap-3">
                                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500 flex-shrink-0" />
                                        <p className="text-gray-700 leading-relaxed">{point}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 rounded-2xl bg-purple-900 text-white p-6">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5" />
                                    <p className="font-semibold">Made by a passionate artisan community</p>
                                </div>
                                <p className="mt-3 text-sm text-purple-100 leading-relaxed">
                                    We work with trained creators and provide consistent process standards to maintain style and quality across every batch.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold">Bring handcrafted resin design into your space</h2>
                    <p className="mt-4 text-white/85 text-base sm:text-lg max-w-3xl mx-auto">
                        Whether you are shopping for your home or finding a thoughtful gift, discover collections that are modern, durable, and intentionally crafted.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-purple-700 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Shop Collection
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white/40 text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
