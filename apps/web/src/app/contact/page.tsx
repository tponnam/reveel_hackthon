"use client";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [sent, setSent] = useState(false);

    return (
        <main>
            <Header />
            <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">
                <span className="text-[12px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-3 py-1.5 rounded-full border border-[var(--brand-100)] tracking-wide uppercase">Contact</span>
                <h1 className="text-[40px] font-bold text-[var(--heading)] mt-6 mb-4">Get in touch</h1>
                <p className="text-[17px] text-[var(--body)] font-medium mb-12 max-w-xl">Have a question, feedback, or want a partnership? We'd love to hear from you.</p>

                <div className="grid md:grid-cols-5 gap-10">
                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-6">
                        {[
                            { icon: Mail, label: "Email", value: "hello@reveel.ai" },
                            { icon: MessageSquare, label: "Support", value: "support@reveel.ai" },
                            { icon: MapPin, label: "HQ", value: "San Francisco, CA" },
                        ].map((c) => (
                            <div key={c.label} className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-xl flex items-center justify-center shrink-0">
                                    <c.icon className="w-4 h-4 text-[var(--brand)]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-[var(--heading)]">{c.label}</p>
                                    <p className="text-[14px] font-medium text-[var(--body)]">{c.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-3 bg-white border border-[var(--border-light)] rounded-2xl p-8">
                        {sent ? (
                            <div className="text-center py-10">
                                <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-[18px] font-bold text-[var(--heading)] mb-2">Message sent!</h3>
                                <p className="text-[14px] text-[var(--body)] font-medium">We'll get back to your within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Name</label>
                                        <input type="text" required placeholder="Your name" className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Email</label>
                                        <input type="email" required placeholder="you@company.com" className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Subject</label>
                                    <input type="text" required placeholder="How can we help?" className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none" />
                                </div>
                                <div>
                                    <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Message</label>
                                    <textarea required rows={4} placeholder="Tell us more..." className="w-full px-4 py-3 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none resize-none" />
                                </div>
                                <button type="submit" className="w-full h-11 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
