"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
    { name: "Starter", description: "For founders & solo creators", price: { monthly: 29, yearly: 24 }, cta: "Start Building", popular: false, features: ["20 AI min / month", "10 demos / month", "1080p export", "Custom branding", "Email support"] },
    { name: "Pro", description: "For continuous product teams", price: { monthly: 79, yearly: 66 }, cta: "Coming soon", popular: true, features: ["50 AI min / month", "50 demos / month", "1440p (2K) export", "Custom templates", "10 languages", "Priority support"] },
    { name: "Scale", description: "For high-volume automation", price: { monthly: 199, yearly: 166 }, cta: "Coming soon", popular: false, features: ["150 AI min / month", "Unlimited demos", "4K native export", "API access", "SSO & RBAC", "Dedicated success"] },
];

export default function Pricing() {
    const [yearly, setYearly] = useState(true);

    return (
        <section id="pricing" className="py-32 bg-[var(--background)] relative border-y border-[var(--border-light)] z-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[var(--heading)] leading-none mb-6">
                        Pricing for <span className="text-[var(--brand)]">scale.</span>
                    </h2>
                    <p className="text-xl text-[var(--body)] font-medium mb-10">
                        Predictable pricing that grows with your engineering velocity.
                    </p>

                    <div className="inline-flex items-center p-1 bg-[var(--surface-dim)] rounded-xl border border-[var(--border-light)] shadow-sm">
                        <button onClick={() => setYearly(false)} className={`px-6 py-2.5 text-[15px] font-bold rounded-lg transition-all ${!yearly ? "bg-white text-[var(--brand)] shadow-sm border border-[var(--border-light)]" : "text-[var(--muted-text)] hover:text-[var(--heading)]"}`}>Monthly</button>
                        <button onClick={() => setYearly(true)} className={`px-6 py-2.5 text-[15px] font-bold rounded-lg transition-all flex items-center gap-2 ${yearly ? "bg-white text-[var(--brand)] shadow-sm border border-[var(--border-light)]" : "text-[var(--muted-text)] hover:text-[var(--heading)]"}`}>
                            Yearly <span className="text-[10px] bg-indigo-100 text-[var(--brand)] border border-indigo-200 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Save 17%</span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className={`relative rounded-[32px] p-8 transition-all duration-500 flex flex-col group ${plan.popular
                                ? "bg-white text-[var(--heading)] shadow-[0_10px_40px_rgba(96,46,223,0.1)] scale-[1.02] border-2 border-[var(--brand)]"
                                : "bg-white border border-[var(--border-light)] shadow-sm hover:shadow-md hover:border-[var(--brand-100)]"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--brand)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm z-20">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8 relative z-10">
                                <h3 className={`text-2xl font-bold mb-2 tracking-tight text-[var(--heading)]`}>{plan.name}</h3>
                                <p className={`text-[15px] font-medium ${plan.popular ? "text-[var(--brand)]" : "text-[var(--body)]"}`}>{plan.description}</p>
                            </div>

                            <div className="mb-8 flex-1 relative z-10">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className={`text-5xl font-black tracking-tight text-[var(--heading)]`}>${yearly ? plan.price.yearly : plan.price.monthly}</span>
                                    <span className={`text-[15px] font-bold text-[var(--muted-text)]`}>/mo</span>
                                </div>
                                <p className={`text-[13px] font-medium text-[var(--muted-text)]`}>
                                    {yearly ? `Billed annually at $${plan.price.yearly * 12}` : "Billed monthly"}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8 relative z-10">
                                {plan.features.map((f) => (
                                    <li key={f} className={`flex items-start gap-3 text-[15px] font-medium text-[var(--heading)]`}>
                                        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.popular ? "bg-[var(--brand-100)] text-[var(--brand)]" : "bg-[var(--surface-dim)] text-[var(--brand)] group-hover:bg-[var(--brand-100)] transition-colors"}`}>
                                            <Check className={`w-3 h-3 stroke-[3]`} />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link href={plan.cta === "Coming soon" ? "#" : "/auth/signup"}
                                className={`flex justify-center flex-shrink-0 items-center py-4 rounded-xl text-[15px] font-bold transition-all relative z-10 ${
                                    plan.cta === "Coming soon"
                                    ? "bg-[#EAEAEA] text-[#888] cursor-not-allowed shadow-none"
                                    : plan.popular
                                    ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] hover:-translate-y-0.5"
                                    : "bg-white text-[var(--heading)] border border-[var(--border-light)] hover:bg-[var(--surface-dim)] shadow-sm"
                                    }`}>
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
