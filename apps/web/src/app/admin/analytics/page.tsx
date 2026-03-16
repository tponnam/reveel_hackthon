"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BarChart3, TrendingUp, Globe, Clock } from "lucide-react";

export default function AdminAnalyticsPage() {
    const [data, setData] = useState({ totalDemos: 0, totalUsers: 0, topDomains: [] as { domain: string; count: number }[] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                const demosSnap = await getDocs(collection(db, "demos"));

                // Extract domains from URLs
                const domainCounts: Record<string, number> = {};
                demosSnap.docs.forEach(d => {
                    const url = d.data().url;
                    if (url) {
                        try {
                            const domain = new URL(url).hostname;
                            domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                        } catch { }
                    }
                });

                const topDomains = Object.entries(domainCounts)
                    .map(([domain, count]) => ({ domain, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                setData({ totalDemos: demosSnap.size, totalUsers: usersSnap.size, topDomains });
            } catch { }
            setLoading(false);
        }
        fetch();
    }, []);

    const weeklyData = [
        { day: "Mon", value: 12 }, { day: "Tue", value: 19 }, { day: "Wed", value: 8 },
        { day: "Thu", value: 24 }, { day: "Fri", value: 31 }, { day: "Sat", value: 5 }, { day: "Sun", value: 3 },
    ];
    const maxVal = Math.max(...weeklyData.map(d => d.value));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Platform Analytics</h2>
                <p className="text-[15px] font-medium text-[var(--body)]">Usage insights and trends across the platform.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid sm:grid-cols-3 gap-5">
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-[var(--brand)]" />
                        </div>
                        <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+18%</span>
                    </div>
                    <p className="text-[28px] font-bold text-[var(--heading)]">{loading ? "—" : data.totalDemos}</p>
                    <p className="text-[13px] font-bold text-[var(--body)]">Demos Generated</p>
                </div>
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+24%</span>
                    </div>
                    <p className="text-[28px] font-bold text-[var(--heading)]">{loading ? "—" : data.totalUsers}</p>
                    <p className="text-[13px] font-bold text-[var(--body)]">Active Users</p>
                </div>
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-[28px] font-bold text-[var(--heading)]">45s</p>
                    <p className="text-[13px] font-bold text-[var(--body)]">Avg. Generation Time</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6">
                    <h3 className="text-[16px] font-bold text-[var(--heading)] mb-6">Weekly Demo Volume</h3>
                    <div className="flex items-end justify-between gap-3 h-40">
                        {weeklyData.map((d) => (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-[11px] font-bold text-[var(--heading)]">{d.value}</span>
                                <div
                                    className="w-full bg-[var(--brand)] rounded-lg transition-all hover:bg-[var(--brand-dark)]"
                                    style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: 8 }}
                                />
                                <span className="text-[11px] font-bold text-[var(--muted-text)]">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Domains */}
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6">
                    <h3 className="text-[16px] font-bold text-[var(--heading)] mb-6">Top Domains</h3>
                    {loading ? (
                        <p className="text-[14px] text-[var(--muted-text)]">Loading...</p>
                    ) : data.topDomains.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Globe className="w-8 h-8 text-[var(--muted-text)] mb-3" />
                            <p className="text-[14px] font-bold text-[var(--body)]">No domain data yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.topDomains.map((d, i) => (
                                <div key={d.domain} className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-[var(--muted-text)] w-5">{i + 1}.</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[13px] font-bold text-[var(--heading)]">{d.domain}</span>
                                            <span className="text-[12px] font-bold text-[var(--body)]">{d.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--surface-dim)] rounded-full overflow-hidden">
                                            <div className="h-full bg-[var(--brand)] rounded-full" style={{ width: `${(d.count / (data.topDomains[0]?.count || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
