"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const manual = [
    "Hours to days from recording to final video",
    "Record 5–10 takes to avoid stumbles",
    "Re-record when UI changes (every release)",
    "Manual cuts, zooms, and transition editing",
    "Hire voiceover artists or fumble scripts",
    "One language at a time",
];
const reveel = [
    "URL → polished video in under 10 minutes",
    "AI gets it right autonomously, every time",
    "One-click re-generation on every release",
    "Smart auto-editing with cuts, zooms, transitions",
    "AI-generated scripts + studio voiceover",
    "10+ languages from a single recording",
];

export default function Comparison() {
    return (
        <section className="section-enterprise bg-[var(--surface-alt)] relative border-b border-[var(--border-light)] overflow-hidden">
            {/* Subtle glow behind comparison */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--brand)]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <span className="badge-label mb-4 border border-[var(--border-light)] bg-white text-[var(--brand)] font-bold tracking-wide shadow-sm">The Old Way vs The New Way</span>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 text-[var(--heading)]">Manual vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-light)] to-[var(--brand)]">Reveel</span></h2>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-6 relative">

                    {/* VS badge in middle */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[var(--border-light)] bg-white text-[var(--muted-text)] font-black flex items-center justify-center z-20 shadow-md hidden md:flex">
                        VS
                    </div>

                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="enterprise-card border-[var(--border-light)] bg-white/50 p-8 rounded-[32px]">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--border-dim)]">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-dim)] border border-[var(--border-light)] flex items-center justify-center text-[var(--muted-text)] shadow-sm">
                                <X className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--heading)] opacity-80">Manual Recording</h3>
                        </div>
                        <ul className="space-y-5">
                            {manual.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-[15px] font-medium text-[var(--body)]">
                                    <X className="w-5 h-5 text-red-500/80 mt-0.5 shrink-0 stroke-[2.5]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="enterprise-card border-[var(--brand-100)] relative overflow-hidden bg-white p-8 rounded-[32px] shadow-xl group border flex flex-col items-start text-left">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--brand)]/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-[var(--brand)]/10 transition-all duration-700" />

                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--border-dim)] w-full relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--brand)] flex items-center justify-center text-white shadow-[0_4px_14px_0_rgba(96,46,223,0.39)]">
                                <Check className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--heading)]">Reveel AI</h3>
                        </div>
                        <ul className="space-y-5 relative z-10">
                            {reveel.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 text-[15px] font-bold text-[var(--heading)]">
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-[var(--brand-100)] flex items-center justify-center mt-0.5">
                                        <Check className="w-3 h-3 text-[var(--brand)] stroke-[3]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
