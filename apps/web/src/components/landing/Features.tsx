"use client";

import { motion } from "framer-motion";
import { Bot, Scissors, Mic, MonitorPlay } from "lucide-react";

export default function Features() {
    return (
        <section id="features" className="section-enterprise bg-[var(--background)] relative border-t border-[var(--border-light)]">
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <motion.span initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="badge-label mb-6 border border-[var(--border-light)] bg-white text-[var(--brand)] shadow-sm font-bold tracking-wide">
                        The Engine
                    </motion.span>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mt-4 mb-6 text-[var(--heading)]">
                        A complete studio, <br className="hidden sm:block" /> driven by <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--brand-light)] to-[var(--brand)]">intelligent agents.</span>
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }} className="text-lg text-[var(--body)] max-w-2xl mx-auto font-medium">
                        We didn&apos;t just build a screen recorder. We built an autonomous browser agent that fundamentally understands your product.
                    </motion.p>
                </div>

                {/* Light Theme Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Bento Item 1: Large Left */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
                        className="bento-card md:col-span-2 bg-white border border-[var(--border-light)] shadow-sm group hover:shadow-md transition-shadow">
                        <div className="bento-card-inner">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-dim)] border border-[var(--border-light)] text-[var(--brand)] flex items-center justify-center mb-8 shadow-sm group-hover:border-[var(--brand-200)] group-hover:text-[var(--brand-dark)] transition-colors duration-500">
                                <Bot className="w-7 h-7 stroke-[2]" />
                            </div>
                            <h3 className="text-3xl font-bold text-[var(--heading)] mb-4">Autonomous Navigation</h3>
                            <p className="text-[var(--body)] leading-relaxed max-w-md font-medium text-lg">
                                Feed Reveel a URL and a text prompt. Our multi-modal agent navigates your app, clicks buttons, fills forms, and captures context entirely on its own.
                            </p>
                        </div>
                        {/* Elegant glowing orb for light theme */}
                        <div className="absolute right-[-10%] bottom-[-20%] w-[300px] h-[300px] bg-[var(--brand)]/5 rounded-full blur-[80px] group-hover:bg-[var(--brand)]/10 transition-all duration-700 pointer-events-none" />
                    </motion.div>

                    {/* Bento Item 2: Small Right top */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
                        className="bento-card bg-[var(--brand)] text-white border-transparent group shadow-[0_10px_30px_rgba(96,46,223,0.15)] hover:shadow-[0_15px_40px_rgba(96,46,223,0.25)] transition-shadow">
                        <div className="bento-card-inner">
                            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center mb-6 backdrop-blur-md">
                                <Mic className="w-6 h-6 stroke-[2]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Studio Voice {`&`} Script</h3>
                            <p className="text-white/90 text-base leading-relaxed font-normal">
                                Gemini writes contextual scripts. Google TTS delivers pristine audio in 10+ languages.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-[60px] pointer-events-none" />
                    </motion.div>

                    {/* Bento Item 3: Small Left Bottom */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}
                        className="bento-card bg-white border border-[var(--border-light)] group hover:border-[var(--brand-100)] shadow-sm hover:shadow-md transition-shadow">
                        <div className="bento-card-inner">
                            <div className="w-12 h-12 rounded-xl bg-[var(--surface-dim)] border border-[var(--border-light)] text-[var(--brand)] flex items-center justify-center mb-6 shadow-sm group-hover:border-[var(--brand-200)] transition-colors duration-500">
                                <Scissors className="w-6 h-6 stroke-[2]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--heading)] mb-3">Smart Auto-Editing</h3>
                            <p className="text-[var(--body)] text-base leading-relaxed font-medium">
                                Automatic cuts, zooms, and crossfades applied intelligently to highlight key UI elements.
                            </p>
                        </div>
                    </motion.div>

                    {/* Bento Item 4: Large Right Bottom */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
                        className="bento-card md:col-span-2 overflow-hidden bg-white border border-[var(--border-light)] group shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row h-full">
                            <div className="p-8 sm:p-10 flex-1 flex flex-col justify-center relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-[var(--surface-dim)] border border-[var(--border-light)] text-[var(--brand)] flex items-center justify-center mb-6 shadow-sm group-hover:border-[var(--brand-200)] transition-colors duration-500">
                                    <MonitorPlay className="w-6 h-6 stroke-[2]" />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--heading)] mb-4">Enterprise Rendering</h3>
                                <p className="text-[var(--body)] leading-relaxed font-medium text-lg">
                                    Export directly in crystal clear 1440p or 4K. Custom brand your intro and outro frames instantly. Embed anywhere with a single tag.
                                </p>
                            </div>
                            <div className="bg-[var(--surface-dim)] md:w-2/5 border-t md:border-t-0 md:border-l border-[var(--border-light)] flex items-center justify-center p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                {/* Abstract rendering block */}
                                <div className="w-full max-w-[200px] aspect-square border border-black/5 bg-white rounded-[24px] relative flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-700">
                                    <div className="w-16 h-16 rounded-full border-[3px] border-[var(--border-light)] border-t-[var(--brand)] animate-spin" style={{ animationDuration: '2s' }} />
                                    <div className="absolute bottom-[-16px] text-[11px] font-bold uppercase tracking-widest text-white bg-[var(--heading)] px-4 py-1.5 rounded-full shadow-lg">4K Render</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
