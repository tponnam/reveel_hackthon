"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Hero() {
    return (
        <section className="relative pt-40 pb-32 overflow-hidden min-h-[95vh] flex items-center bg-[var(--background)]">
            {/* Very Light Blurple Ambient Glows */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[var(--brand)]/5 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 relative z-10 w-full flex flex-col items-center">
                <div className="text-center max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex justify-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-light)] hover:border-[var(--brand-100)] transition-colors cursor-pointer group shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-[var(--brand)] transition-colors" />
                            <span className="text-[13px] font-semibold tracking-wide text-[var(--brand)]">Introducing Reveel Engine 2.0</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-7xl lg:text-[88px] font-bold text-[var(--heading)] leading-[1.05] tracking-tight mb-8"
                    >
                        Demo automation <br className="hidden md:block" />
                        <span className="text-[var(--brand)] drop-shadow-sm">at enterprise scale.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-lg sm:text-[22px] text-[var(--body)] mb-12 max-w-3xl mx-auto font-medium leading-relaxed tracking-wide"
                    >
                        The intelligent orchestrator that turns a single URL into a studio-quality product video. No staging environments. No manual recording.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5"
                    >
                        <Link href="/auth/signup" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white rounded-full text-base font-semibold transition-all shadow-[0_8px_20px_rgba(96,46,223,0.3)] hover:-translate-y-0.5">
                            Start Building Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white hover:bg-[var(--surface-dim)] text-[var(--heading)] rounded-full text-base font-semibold transition-all border border-[var(--border-light)] shadow-sm hover:shadow-md">
                            <Play className="w-4 h-4 text-[var(--heading)] group-hover:text-[var(--brand)] transition-colors" />
                            Watch the video
                        </button>
                    </motion.div>
                </div>

                {/* Elegant Video Player Mockup in Light Theme */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-5xl mx-auto mt-24"
                >
                    <div className="relative rounded-[24px] overflow-hidden border border-[var(--border-light)] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),0_0_0_8px_rgba(255,255,255,0.5)] group ring-1 ring-black/5 p-2">
                        <div className="aspect-[16/9] bg-[url('https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=2800')] bg-cover bg-center relative transition-transform duration-700 group-hover:scale-[1.02] rounded-[16px] overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center transition-all duration-500 group-hover:bg-white/5">
                                <div className="w-20 h-20 bg-white/80 backdrop-blur-md border border-[var(--brand-100)] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(96,46,223,0.2)] cursor-pointer hover:bg-white hover:scale-110 transition-all duration-300">
                                    <Play className="w-8 h-8 ml-1 text-[var(--brand)] fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
