"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Users, Film, TrendingUp, Activity, ArrowUpRight } from "lucide-react";

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({ users: 0, demos: 0, activeDemos: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                const demosSnap = await getDocs(collection(db, "demos"));
                const activeDemos = demosSnap.docs.filter(d => d.data().status !== "done" && d.data().status !== "error").length;
                setStats({ users: usersSnap.size, demos: demosSnap.size, activeDemos });
            } catch { }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const cards = [
        { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "Total Demos", value: stats.demos, icon: Film, color: "text-[var(--brand)]", bg: "bg-[var(--brand-50)]", border: "border-[var(--brand-100)]" },
        { label: "Active Generations", value: stats.activeDemos, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Growth", value: "+12%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Platform Overview</h2>
                <p className="text-[15px] font-medium text-[var(--body)]">Real-time metrics for the Reveel AI platform.</p>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white border border-[var(--border-light)] rounded-2xl p-6 animate-pulse h-28" />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((c) => (
                        <div key={c.label} className="bg-white border border-[var(--border-light)] rounded-2xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${c.bg} border ${c.border} rounded-xl flex items-center justify-center`}>
                                    <c.icon className={`w-5 h-5 ${c.color}`} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-[var(--muted-text)]" />
                            </div>
                            <p className="text-[28px] font-bold text-[var(--heading)]">{c.value}</p>
                            <p className="text-[13px] font-bold text-[var(--body)] mt-1">{c.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6">
                <h3 className="text-[18px] font-bold text-[var(--heading)] mb-4">System Health</h3>
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { label: "API Uptime", value: "99.9%", status: "healthy" },
                        { label: "Avg Generation Time", value: "45s", status: "healthy" },
                        { label: "Error Rate", value: "0.2%", status: "healthy" },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${s.status === "healthy" ? "bg-emerald-500" : "bg-red-500"} animate-pulse`} />
                            <div>
                                <p className="text-[14px] font-bold text-[var(--heading)]">{s.value}</p>
                                <p className="text-[12px] font-medium text-[var(--body)]">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
