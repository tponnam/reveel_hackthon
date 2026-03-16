"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
    { q: "What exactly is Reveel?", a: "Reveel is an AI demo agent that turns your product URL + a prompt into a polished, narrated demo video. It navigates your product like a real user, records the session, generates a voiceover script, narrates it, adds captions, and exports a branded video." },
    { q: "Does it actually navigate my site autonomously?", a: "Yes. Reveel uses a Playwright-based browser agent powered by Google ADK. It clicks, types, scrolls, and navigates — just like a real user. You describe the flow and the AI does the rest." },
    { q: "What languages are supported?", a: "10+ languages including English, Spanish, French, German, Japanese, Korean, Portuguese, Italian, Chinese, and Hindi." },
    { q: "Can I use my own branding?", a: "Absolutely. Upload your logo, set brand colors, choose a font, and customize intro/outro slides. Every demo looks like it came from your design team." },
    { q: "How long does it take to generate a demo?", a: "Most demos are ready in under 10 minutes. The AI navigates, captures, scripts, narrates, edits, and exports — all on autopilot." },
    { q: "Can it handle login-protected pages?", a: "Yes. Provide staging credentials in your prompt and Reveel logs in automatically. Uses isolated browser sessions so credentials stay secure." },
    { q: "What formats and resolutions are supported?", a: "Export in MP4 at 720p, 1080p, 1440p (2K), or 4K depending on your plan. SRT caption files are also available." },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="section-enterprise bg-[var(--surface-alt)]">
            <div className="mx-auto max-w-3xl px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <span className="badge-label mb-4 border border-[var(--border-light)] bg-white text-[var(--brand)] shadow-sm font-bold tracking-wide">FAQ</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-4 text-[var(--heading)]">Frequently asked questions</h2>
                </motion.div>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                            className="bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden hover:border-[var(--brand-200)] hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                                <span className="text-[16px] font-bold text-[var(--heading)] pr-4">{faq.q}</span>
                                <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${open === i ? "bg-[var(--brand-50)] text-[var(--brand)]" : "bg-[var(--surface-dim)] text-[var(--brand-light)] hover:bg-[var(--brand-50)] hover:text-[var(--brand)]"
                                    }`}>
                                    <Plus className={`w-5 h-5 transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} />
                                </span>
                            </button>
                            <AnimatePresence>
                                {open === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                                        <div className="px-5 pb-5 text-[15px] font-medium text-[var(--body)] leading-relaxed border-t border-[var(--border-light)] pt-4">{faq.a}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
