"use client";

import { motion } from "framer-motion";
import { Database, Lock, RefreshCcw, BrainCircuit, BarChart3, Webhook } from "lucide-react";

const differentiators = [
    { icon: Database, title: "Smart Test Data", description: "Fills forms with realistic names, emails — no more test@test.com." },
    { icon: Lock, title: "Auth-Aware Agent", description: "Pass staging credentials and the agent logs in automatically." },
    { icon: RefreshCcw, title: "One-Click Re-gen", description: "UI changed? Re-run with one click. No re-recording needed." },
    { icon: BrainCircuit, title: "Context Intelligence", description: "Understands your product from URL + prompt for relevant narration." },
    { icon: BarChart3, title: "Analytics Ready", description: "Track views, engagement, and drop-off metrics per demo." },
    { icon: Webhook, title: "API & Webhooks", description: "Trigger generation from CI/CD, Slack, or any workflow." },
];

export default function Differentiators() {
    return (
        <section className="section-enterprise relative overflow-hidden bg-[var(--background)] border-b border-[var(--border-light)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <span className="badge-label mb-4 border border-[var(--border-light)] bg-white text-[var(--brand)] font-bold tracking-wide shadow-sm">Why Reveel</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-[var(--heading)]">Built for enterprise product teams</h2>
                </motion.div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {differentiators.map((d, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="enterprise-card bg-white border border-[var(--border-light)] hover:border-[var(--brand-100)] hover:shadow-md transition-all duration-300 group p-8 rounded-[24px]">
                            <div className="w-12 h-12 rounded-xl bg-[var(--surface-dim)] border border-[var(--border-light)] text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white group-hover:border-[var(--brand)] group-hover:shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] flex items-center justify-center mb-6 shadow-sm transition-all duration-500">
                                <d.icon className="w-5 h-5 stroke-[2]" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--heading)] mb-3">{d.title}</h3>
                            <p className="text-[15px] text-[var(--body)] leading-relaxed font-medium">{d.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
