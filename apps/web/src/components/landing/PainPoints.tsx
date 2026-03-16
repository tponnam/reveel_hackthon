"use client";

import { motion } from "framer-motion";
import { Clock, Mic, Globe2 } from "lucide-react";

const painPoints = [
    { icon: Clock, title: "Hours wasted recording", description: "Record 5–10 takes, edit cuts and zooms, re-record every release cycle.", stat: "4.2 hrs", statLabel: "avg time per demo" },
    { icon: Mic, title: "Voiceover nightmares", description: "Stumble over scripts, pay voiceover artists, or re-record endlessly.", stat: "$500+", statLabel: "per voiceover" },
    { icon: Globe2, title: "Single language", description: "Your product supports 10 languages but your demo only speaks English.", stat: "72%", statLabel: "prefer native language" },
];

export default function PainPoints() {
    return (
        <section className="section-enterprise relative">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <span className="badge-label mb-4">The Problem</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-4">
                        Manual demo recording is <span className="gradient-text">broken</span>
                    </h2>
                    <p className="text-lg text-[var(--body)] max-w-xl mx-auto">You&apos;re spending more time making the demo than building the product.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {painPoints.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="enterprise-card">
                            <div className="w-12 h-12 rounded-xl bg-[var(--brand-50)] text-[var(--brand)] flex items-center justify-center mb-6">
                                <item.icon className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--heading)] mb-2">{item.title}</h3>
                            <p className="text-sm text-[var(--body)] leading-relaxed mb-6">{item.description}</p>
                            <div className="pt-5 border-t border-[var(--border-light)]">
                                <span className="text-2xl font-black gradient-text">{item.stat}</span>
                                <p className="text-xs text-[var(--muted-text)] mt-1">{item.statLabel}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
