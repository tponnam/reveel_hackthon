"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
    return (
        <section className="py-24">
            <div className="mx-auto max-w-5xl px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[var(--brand)] via-[#5B2FCC] to-[#4F46E5] p-12 sm:p-16 text-center">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/[0.05] rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/[0.03] rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Ready to automate your demos?</h2>
                        <p className="text-lg text-white/80 max-w-lg mx-auto mb-8">Join product teams shipping polished demos in minutes, not days. Start free — no credit card required.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[var(--brand)] font-bold text-[15px] rounded-xl hover:bg-white/90 transition-all shadow-lg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                Get Started Free
                            </Link>
                            <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3.5 text-white/90 font-semibold text-sm border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all">View Pricing</a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
