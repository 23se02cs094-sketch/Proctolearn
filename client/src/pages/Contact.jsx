import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ChevronDown,
    Clock3,
    Headset,
    Mail,
    MapPin,
    MessageSquare,
    PackageCheck,
    Phone,
    Send,
    Sparkles,
} from "lucide-react";

const contactChannels = [
    {
        title: "Email Support",
        detail: "info@theresinworld.com",
        description: "Best for product queries, collaboration, and general support.",
        icon: Mail,
        href: "mailto:info@theresinworld.com",
        accent: "from-indigo-500 to-purple-500",
    },
    {
        title: "Call or WhatsApp",
        detail: "9023972308",
        description: "For urgent order help and shipping updates.",
        icon: Phone,
        href: "tel:9023972308",
        accent: "from-pink-500 to-rose-500",
    },
    {
        title: "Visit Studio",
        detail: "54, Aksharsham Socity, Surat",
        description: "54,aksharsham socity ,near hathi mandir road ,katargam,surat",
        icon: MapPin,
        href: "https://maps.google.com/?q=54+Aksharsham+Socity+near+Hathi+Mandir+Road+Katargam+Surat",
        accent: "from-emerald-500 to-teal-500",
    },
];

const supportMeta = [
    { label: "Average first response", value: "2-4 hours", icon: Clock3 },
    { label: "Support window", value: "Mon-Sat, 10am-7pm", icon: Headset },
    { label: "Order assistance", value: "Tracked till delivery", icon: PackageCheck },
];

const faqs = [
    {
        question: "How quickly do you respond to contact form messages?",
        answer:
            "Most messages receive a reply within 2-4 business hours. During peak order periods, it may take up to one business day.",
    },
    {
        question: "Can I request a custom resin design?",
        answer:
            "Yes. Share your color palette, purpose, and budget in your message. Our team will confirm feasibility and timeline.",
    },
    {
        question: "How do I report a damaged product delivery?",
        answer:
            "Add your order ID and attach clear photos in your message. We prioritize damaged-delivery requests and provide quick resolution steps.",
    },
    {
        question: "Do you support bulk or gifting orders?",
        answer:
            "Yes, we support corporate and event gifting quantities. Mention delivery city and expected date for a custom quote.",
    },
];

const defaultForm = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    orderId: "",
    message: "",
    preferredContact: "Email",
};

const Contact = () => {
    const [formData, setFormData] = useState(defaultForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!formData.name.trim()) {
            nextErrors.name = "Name is required.";
        }

        if (!formData.email.trim()) {
            nextErrors.email = "Email is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            nextErrors.email = "Please enter a valid email address.";
        }

        if (!formData.subject.trim()) {
            nextErrors.subject = "Please add a subject.";
        }

        if (!formData.message.trim()) {
            nextErrors.message = "Please describe your query.";
        } else if (formData.message.trim().length < 10) {
            nextErrors.message = "Message should be at least 10 characters.";
        }

        return nextErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nextErrors = validateForm();
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            toast.error("Please fix the highlighted fields.");
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setFormData(defaultForm);
            toast.success("Message sent. Our team will contact you shortly.");
        }, 700);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-fuchsia-800 text-white pt-28 sm:pt-32 pb-16 sm:pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.28),transparent_42%)]" />
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm">
                                <Sparkles className="h-4 w-4" />
                                Contact The Resin World
                            </span>
                            <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
                                Let us help with orders, custom designs, and everything in between.
                            </h1>
                            <p className="mt-4 text-base sm:text-lg text-purple-100 leading-relaxed max-w-2xl">
                                Send us your query and our support team will respond quickly with clear next steps.
                                Whether it is a product question, shipping issue, or gifting request, we are here for you.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
                            {supportMeta.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5">
                                    <item.icon className="h-5 w-5 text-pink-200" />
                                    <p className="mt-3 text-xl font-semibold">{item.value}</p>
                                    <p className="text-sm text-purple-100">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid md:grid-cols-3 gap-6">
                        {contactChannels.map((channel) => (
                            <a
                                key={channel.title}
                                href={channel.href}
                                target={channel.href.startsWith("http") ? "_blank" : undefined}
                                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${channel.accent} text-white flex items-center justify-center shadow-md`}>
                                    <channel.icon className="h-5 w-5" />
                                </div>
                                <h2 className="mt-4 text-xl font-semibold text-gray-900">{channel.title}</h2>
                                <p className="mt-1 text-purple-700 font-medium">{channel.detail}</p>
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{channel.description}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid xl:grid-cols-5 gap-8 items-start">
                        <div className="xl:col-span-3 rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-6 w-6 text-purple-600" />
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Send us a message</h2>
                            </div>
                            <p className="mt-2 text-gray-600">
                                Fill this form and our team will get back with a personalized response.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Your name"
                                            className={`input-field ${errors.name ? "border-red-400 focus:ring-red-200" : ""}`}
                                        />
                                        {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="you@example.com"
                                            className={`input-field ${errors.email ? "border-red-400 focus:ring-red-200" : ""}`}
                                        />
                                        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Phone Number (Optional)
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="+91 98XXXXXXXX"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Preferred Contact
                                        </label>
                                        <select
                                            id="preferredContact"
                                            name="preferredContact"
                                            value={formData.preferredContact}
                                            onChange={handleChange}
                                            className="input-field"
                                        >
                                            <option>Email</option>
                                            <option>Phone</option>
                                            <option>WhatsApp</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="How can we help?"
                                            className={`input-field ${errors.subject ? "border-red-400 focus:ring-red-200" : ""}`}
                                        />
                                        {errors.subject && <p className="mt-1.5 text-xs text-red-600">{errors.subject}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Order ID (Optional)
                                        </label>
                                        <input
                                            id="orderId"
                                            name="orderId"
                                            value={formData.orderId}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Example: ORD-1024"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Share details so we can provide the best help..."
                                        className={`input-field resize-y min-h-[140px] ${errors.message ? "border-red-400 focus:ring-red-200" : ""}`}
                                    />
                                    {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <Send className="h-4 w-4" />
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>

                        <aside className="xl:col-span-2 space-y-6">
                            <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-7">
                                <h3 className="text-xl font-semibold text-gray-900">Office and Support Hours</h3>
                                <div className="mt-5 space-y-4 text-sm text-gray-700">
                                    <p className="flex items-center justify-between border-b border-purple-100 pb-3">
                                        <span>Monday - Friday</span>
                                        <span className="font-semibold">10:00 AM - 7:00 PM</span>
                                    </p>
                                    <p className="flex items-center justify-between border-b border-purple-100 pb-3">
                                        <span>Saturday</span>
                                        <span className="font-semibold">11:00 AM - 5:00 PM</span>
                                    </p>
                                    <p className="flex items-center justify-between">
                                        <span>Sunday</span>
                                        <span className="font-semibold">Closed</span>
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-900">Need faster help?</h3>
                                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                                    For urgent updates related to active orders, call or WhatsApp us directly.
                                </p>
                                <a
                                    href="tel:9023972308"
                                    className="mt-5 inline-flex items-center gap-2 text-purple-700 font-semibold hover:text-purple-800"
                                >
                                    <Phone className="h-4 w-4" />
                                    9023972308
                                </a>
                            </div>

                            <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                                <div className="h-48 bg-gradient-to-br from-slate-800 via-purple-700 to-fuchsia-700 p-6 text-white flex flex-col justify-between">
                                    <p className="text-sm uppercase tracking-wide text-purple-100">Studio Location</p>
                                    <div>
                                        <p className="font-semibold text-lg">The Resin World</p>
                                        <p className="text-sm text-purple-100">54,aksharsham socity ,near hathi mandir road ,katargam,surat</p>
                                    </div>
                                </div>
                                <a
                                    href="https://maps.google.com/?q=54+Aksharsham+Socity+near+Hathi+Mandir+Road+Katargam+Surat"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between px-6 py-4 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                                >
                                    Open in Google Maps
                                    <MapPin className="h-4 w-4" />
                                </a>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-10 items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="mt-3 text-gray-600 max-w-xl">
                                Quick answers to common support and order questions.
                            </p>
                            <div className="mt-6 space-y-3">
                                {faqs.map((item, index) => {
                                    const isOpen = expandedFaq === index;
                                    return (
                                        <article key={item.question} className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedFaq(isOpen ? -1 : index)}
                                                className="w-full px-5 py-4 text-left flex items-center justify-between gap-3"
                                            >
                                                <span className="font-medium text-gray-900">{item.question}</span>
                                                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {isOpen && (
                                                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900 text-white p-8 sm:p-10">
                            <h3 className="text-2xl font-bold">Looking for products right now?</h3>
                            <p className="mt-3 text-gray-200 leading-relaxed">
                                Explore our latest handcrafted collections while our support team prepares your response.
                            </p>
                            <div className="mt-7 flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-purple-800 font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Browse Products
                                </Link>
                                <Link
                                    to="/categories"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                                >
                                    View Categories
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;