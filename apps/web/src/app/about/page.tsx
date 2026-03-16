import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Users, Target, Zap, Globe } from "lucide-react";

export const metadata = {
    title: "About — Reveel AI",
    description: "Learn about Reveel AI's mission to transform how product teams create demo videos using AI agents.",
};

export default function AboutPage() {
    return (
        <main>
            <Header />
            <div className="pt-32 pb-20">
                {/* Hero */}
                <section className="max-w-4xl mx-auto px-6 text-center mb-20">
                    <span className="text-[12px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-3 py-1.5 rounded-full border border-[var(--brand-100)] tracking-wide uppercase">Our Story</span>
                    <h1 className="text-[48px] font-bold text-[var(--heading)] mt-6 mb-6 leading-tight">We're building the future of<br /><span className="text-[var(--brand)]">product storytelling</span></h1>
                    <p className="text-[18px] text-[var(--body)] font-medium leading-relaxed max-w-2xl mx-auto">
                        Reveel AI was founded with a simple belief: every product deserves a great demo, and creating one shouldn't require a video team, expensive tools, or weeks of editing.
                    </p>
                </section>

                {/* Values */}
                <section className="max-w-5xl mx-auto px-6 mb-20">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: "Mission-Driven", desc: "We believe great products speak for themselves — they just need the right showcase." },
                            { icon: Zap, title: "AI-First", desc: "Every feature is powered by intelligent agents that learn and adapt to your product." },
                            { icon: Users, title: "Team-Centric", desc: "Built for product, sales, and marketing teams who need demos yesterday." },
                            { icon: Globe, title: "Global Reach", desc: "Multi-language support so your demos resonate with audiences worldwide." },
                        ].map((v) => (
                            <div key={v.title} className="bg-white border border-[var(--border-light)] rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                <div className="w-10 h-10 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-xl flex items-center justify-center mb-4">
                                    <v.icon className="w-5 h-5 text-[var(--brand)]" />
                                </div>
                                <h3 className="text-[16px] font-bold text-[var(--heading)] mb-2">{v.title}</h3>
                                <p className="text-[14px] text-[var(--body)] font-medium leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="max-w-4xl mx-auto px-6 mb-20">
                    <div className="bg-[var(--surface-dim)] border border-[var(--border-light)] rounded-3xl p-10 grid sm:grid-cols-3 gap-8 text-center">
                        {[
                            { stat: "10,000+", label: "Demos Generated" },
                            { stat: "500+", label: "Teams Onboarded" },
                            { stat: "4.9★", label: "Average Rating" },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-[36px] font-bold text-[var(--brand)]">{s.stat}</p>
                                <p className="text-[14px] font-bold text-[var(--body)] mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    );
}
