"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    { quote: "Sent our deck with a Reveel video instead of doing a live walkthrough. Made it the same morning. Haven't touched Loom since.", name: "Alex K.", role: "Founder, SaaS Startup", initials: "AK" },
    { quote: "We build AI products. Gave it our staging URL, described the flow, had something clean in about 10 minutes. This isn't just a wrapper.", name: "Maya R.", role: "CTO, AI Company", initials: "MR" },
    { quote: "Stopped asking for a discovery call. Just drop a demo in the first email now. People bring up specific features when they reply.", name: "Diana L.", role: "Head of Sales, B2B SaaS", initials: "DL" },
    { quote: "Our demo was three product updates behind. Re-recording properly takes an hour. Did the whole thing including localization in 8 minutes.", name: "Raj P.", role: "Product Lead, Enterprise", initials: "RP" },
];

export default function Testimonials() {
    return (
        <section className="section-enterprise bg-[var(--background)] relative border-b border-[var(--border-light)]">
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <span className="badge-label mb-4 border border-[var(--border-light)] bg-white text-[var(--brand)] shadow-sm font-bold tracking-wide">Testimonials</span>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 text-[var(--heading)]">Loved by product teams</h2>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="enterprise-card bg-[var(--surface-alt)] border border-[var(--border-light)] hover:border-[var(--brand-100)] hover:shadow-md p-8 rounded-[32px] transition-all duration-300 group">
                            <div className="flex gap-1 mb-8">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />)}
                            </div>
                            <blockquote className="text-lg text-[var(--heading)] leading-relaxed mb-8 font-semibold">&ldquo;{t.quote}&rdquo;</blockquote>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--brand)] flex items-center justify-center text-sm font-bold text-white shadow-sm">{t.initials}</div>
                                <div>
                                    <p className="text-base font-bold text-[var(--heading)]">{t.name}</p>
                                    <p className="text-sm text-[var(--muted-text)] font-medium">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
