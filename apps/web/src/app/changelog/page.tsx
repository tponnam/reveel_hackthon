import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Sparkles, Bug, Zap, Globe } from "lucide-react";

export const metadata = {
    title: "Changelog — Reveel AI",
    description: "See what's new in Reveel AI. Product updates, improvements, and bug fixes.",
};

const releases = [
    {
        version: "1.3.0",
        date: "March 5, 2026",
        title: "TypeScript Agent Pipeline",
        type: "feature" as const,
        items: [
            "Migrated AI agent pipeline from Python to TypeScript",
            "Playwright video recording replaces screenshot stitching",
            "Real-time Firestore progress updates during generation",
            "Google Cloud TTS voiceover integration",
            "FFmpeg video + audio merge for final output",
        ],
    },
    {
        version: "1.2.0",
        date: "February 28, 2026",
        title: "Reveel AI Rebrand",
        type: "improvement" as const,
        items: [
            "Rebranded from DemoForge to Reveel AI",
            "New logo and favicon",
            "Montserrat typography system",
            "SimplAI-inspired color palette",
            "Consistent theme across all pages",
        ],
    },
    {
        version: "1.1.0",
        date: "February 20, 2026",
        title: "Enterprise Dashboard",
        type: "feature" as const,
        items: [
            "Premium dashboard with collapsible sidebar",
            "Demo Library with real-time status tracking",
            "Brand Kit page for custom branding",
            "Settings page with profile management",
            "User avatar dropdown with sign-out",
        ],
    },
    {
        version: "1.0.0",
        date: "February 10, 2026",
        title: "Initial Launch",
        type: "feature" as const,
        items: [
            "Landing page with 11 premium sections",
            "Firebase authentication (email + Google)",
            "Demo generation form with persona selection",
            "Multi-language and resolution support",
        ],
    },
];

const typeConfig = {
    feature: { icon: Sparkles, color: "text-[var(--brand)]", bg: "bg-[var(--brand-50)]", border: "border-[var(--brand-100)]", label: "Feature" },
    improvement: { icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Improvement" },
    fix: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", label: "Fix" },
};

export default function ChangelogPage() {
    return (
        <main>
            <Header />
            <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
                <span className="text-[12px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-3 py-1.5 rounded-full border border-[var(--brand-100)] tracking-wide uppercase">Changelog</span>
                <h1 className="text-[40px] font-bold text-[var(--heading)] mt-6 mb-4">What's New</h1>
                <p className="text-[17px] text-[var(--body)] font-medium mb-12">All the latest updates, improvements, and fixes to Reveel AI.</p>

                <div className="space-y-10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-[var(--border-light)] pl-8">
                    {releases.map((r) => {
                        const tc = typeConfig[r.type];
                        return (
                            <div key={r.version} className="relative">
                                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-white border-2 border-[var(--brand)] -translate-x-1/2" />
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[14px] font-bold text-[var(--heading)]">v{r.version}</span>
                                    <span className={`text-[11px] font-bold ${tc.color} ${tc.bg} px-2 py-0.5 rounded-md border ${tc.border} flex items-center gap-1`}>
                                        <tc.icon className="w-3 h-3" /> {tc.label}
                                    </span>
                                    <span className="text-[12px] font-medium text-[var(--muted-text)]">{r.date}</span>
                                </div>
                                <h3 className="text-[18px] font-bold text-[var(--heading)] mb-3">{r.title}</h3>
                                <ul className="space-y-2">
                                    {r.items.map((item, i) => (
                                        <li key={i} className="text-[14px] text-[var(--body)] font-medium flex items-start gap-2">
                                            <span className="text-[var(--brand)] mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </main>
    );
}
