"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Zap, Video, Palette, Settings } from "lucide-react";

const platformCards = [
    {
        title: "Generate Demo Video",
        href: "/dashboard/generate",
        icon: Zap,
        description: "Paste a URL and autonomously record, narrate, and edit a studio-quality product demo."
    },
    {
        title: "Demo Library",
        href: "/dashboard/demos",
        icon: Video,
        description: "Access your centralized library of generated product videos. View, edit, or export in 4K."
    },
    {
        title: "Brand Kit Configuration",
        href: "/dashboard/brand-kit",
        icon: Palette,
        description: "Enforce brand consistency by uploading logos, strict color palettes, and custom typography."
    },
    {
        title: "Platform Settings & Usage",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Manage your subscription plan, monitor AI generation minutes, and update team access."
    },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const displayName = user?.displayName || "User";

    return (
        <div className="space-y-12">
            {/* Header Area matching screenshot precisely */}
            <div className="max-w-3xl space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--heading)]">
                    Hi, {displayName}
                </h1>
                <p className="text-[16px] text-[#4a4a4a] leading-relaxed">
                    Explore our platform to generate, customize, and manage AI-driven product demos
                    tailored for your specific marketing needs.
                </p>
            </div>

            {/* 2x2 Grid Area matching screenshot precisely */}
            <div className="grid md:grid-cols-2 gap-5">
                {platformCards.map((card, i) => (
                    <Link key={i} href={card.href} className="block group outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="h-full bg-white border border-[#EAEAEA] rounded-[12px] p-6 hover:border-[var(--brand-200)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#FAFAFA] border border-[#f0f0f0] flex items-center justify-center text-[#4a4a4a] group-hover:text-[var(--brand)] group-hover:bg-[#F3E8FF] group-hover:border-[var(--brand-100)] transition-colors">
                                    <card.icon className="w-5 h-5 stroke-[2]" />
                                </div>
                                <div className="pt-0.5 space-y-2">
                                    <h2 className="text-[15px] font-bold text-[#111]">
                                        {card.title}
                                    </h2>
                                    <p className="text-[13px] text-[#737373] leading-relaxed font-medium">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
