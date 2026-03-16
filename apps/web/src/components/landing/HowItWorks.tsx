"use client";

import { motion } from "framer-motion";
import { Link2, Bot, Video, Share } from "lucide-react";

const steps = [
    { number: "01", icon: Link2, title: "Provide a URL", description: "Paste your product's URL and describe the workflow. We bypass the need for staging environment setup." },
    { number: "02", icon: Bot, title: "Autonomous Capture", description: "Our intelligent agents navigate your app, clicking and typing to capture the perfect flow." },
    { number: "03", icon: Video, title: "AI Generation", description: "We synthesize the capturing into a pristine video, with auto-zooms, panning, and studio narration." },
    { number: "04", icon: Share, title: "Ship it", description: "Export in blazing fast 4K. Distribute localized versions globally without re-recording." },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-[var(--surface-alt)] border-y border-[var(--border-light)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mb-24">
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--heading)] leading-none mb-6">
                        No recording. <br className="hidden sm:block" />
                        <span className="text-[var(--brand)]">Just prompt.</span>
                    </h2>
                    <p className="text-xl text-[var(--body)] leading-relaxed font-medium">
                        Watch how our multi-agent architecture turns a simple URL into a complete product walkthrough in under two minutes.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="relative group"
                        >
                            {/* Line connecting steps (desktop) */}
                            {i !== steps.length - 1 && (
                                <div className="hidden lg:block absolute top-6 flex-1 w-full left-[60px] h-[1px] bg-gradient-to-r from-[var(--border-light)] to-transparent" />
                            )}

                            <div className="w-12 h-12 bg-white border border-[var(--border-light)] rounded-xl flex items-center justify-center shadow-sm mb-8 relative z-10 group-hover:border-[var(--brand)] group-hover:shadow-[0_4px_14px_rgba(96,46,223,0.1)] transition-all duration-500">
                                <step.icon className="w-5 h-5 text-[var(--brand)] stroke-[2] group-hover:scale-110 transition-transform" />
                            </div>

                            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--brand-light)] mb-3">
                                Step {step.number}
                            </div>
                            <h3 className="text-xl font-bold text-[var(--heading)] mb-3 leading-tight">{step.title}</h3>
                            <p className="text-[var(--body)] text-[15px] leading-relaxed font-medium">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
