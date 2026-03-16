"use client";

import { Image as ImageIcon, Type, Palette as PaletteIcon, Wand2 } from "lucide-react";

export default function BrandKitPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-6">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Brand Kit</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">Customize the look and feel of your generated videos.</p>
                </div>
                <button className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white h-11 px-6 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(96,46,223,0.23)]">
                    Save Changes
                </button>
            </div>

            <div className="space-y-8">
                {/* Logo */}
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <ImageIcon className="w-5 h-5 text-[var(--muted-text)]" />
                            Company Logo
                        </h3>
                        <p className="text-[14px] font-medium text-[var(--body)] leading-relaxed">High resolution PNG or SVG. Transparent background recommended.</p>
                    </div>
                    <div className="md:w-2/3 p-8 flex items-center justify-center">
                        <div className="w-full border border-dashed border-[var(--border-light)] hover:border-[var(--brand)] bg-[var(--surface-dim)] rounded-2xl p-10 text-center transition-all cursor-pointer group shadow-sm">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white border border-[var(--border-light)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="w-6 h-6 text-[var(--muted-text)] group-hover:text-[var(--brand)] transition-colors" />
                            </div>
                            <p className="text-[15px] font-bold text-[var(--heading)] group-hover:text-[var(--brand)] transition-colors">Click or drag to upload</p>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <PaletteIcon className="w-5 h-5 text-[var(--muted-text)]" />
                            Brand Colors
                        </h3>
                        <p className="text-[14px] font-medium text-[var(--body)] leading-relaxed">Used for highlights, buttons, and captions within the demo.</p>
                    </div>
                    <div className="md:w-2/3 p-8 space-y-6">
                        {[
                            { label: "Primary Color", default: "#602edf" },
                            { label: "Secondary Color", default: "#8c5fff" },
                        ].map((color) => (
                            <div key={color.label} className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl border border-[var(--border-light)] shadow-sm shrink-0" style={{ background: color.default }} />
                                <div className="flex-1 flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">{color.label}</label>
                                        <input
                                            defaultValue={color.default}
                                            className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-11 rounded-xl px-4 text-[15px] font-bold font-mono uppercase text-[var(--heading)] shadow-sm outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Typography */}
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <Type className="w-5 h-5 text-[var(--muted-text)]" />
                            Typography
                        </h3>
                        <p className="text-[14px] font-medium text-[var(--body)] leading-relaxed">Fonts used in intro/outro slides and captions.</p>
                    </div>
                    <div className="md:w-2/3 p-8 space-y-6">
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">Heading Font</label>
                            <select className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-11 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] shadow-sm outline-none cursor-pointer">
                                <option>Montserrat (Default)</option>
                                <option>Inter</option>
                                <option>Geist</option>
                                <option>SF Pro Display</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">Body Font</label>
                            <select className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-11 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] shadow-sm outline-none cursor-pointer">
                                <option>Montserrat</option>
                                <option>Inter</option>
                                <option>SF Pro Text</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Intro/Outro */}
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <Wand2 className="w-5 h-5 text-[var(--muted-text)]" />
                            Intro & Outro
                        </h3>
                        <p className="text-[14px] font-medium text-[var(--body)] leading-relaxed">Title cards appended to your generated video.</p>
                    </div>
                    <div className="md:w-2/3 p-8 space-y-6">
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">Intro Title</label>
                            <input placeholder="Welcome to Reveel..." className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-11 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] placeholder:text-[var(--muted-text)] shadow-sm outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">Outro Call to Action</label>
                            <input placeholder="Start your free trial today..." className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-11 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] placeholder:text-[var(--muted-text)] shadow-sm outline-none transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
