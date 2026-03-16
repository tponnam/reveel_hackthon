"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Film, Trash2, ExternalLink, Search, Clock } from "lucide-react";

interface DemoData {
    id: string;
    url: string;
    userId: string;
    status: string;
    progress: number;
    title?: string;
    createdAt: any;
}

export default function AdminDemosPage() {
    const [demos, setDemos] = useState<DemoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchDemos() {
            try {
                const snap = await getDocs(collection(db, "demos"));
                const data = snap.docs.map(d => ({ ...(d.data() as DemoData), id: d.id }));
                setDemos(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            } catch { }
            setLoading(false);
        }
        fetchDemos();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this demo globally?")) return;
        await deleteDoc(doc(db, "demos", id));
        setDemos(prev => prev.filter(d => d.id !== id));
    };

    const filtered = demos.filter(d =>
        d.url?.toLowerCase().includes(search.toLowerCase()) ||
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.userId?.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = (s: string) => {
        if (s === "done") return "text-emerald-600 bg-emerald-50 border-emerald-100";
        if (s === "error") return "text-red-600 bg-red-50 border-red-100";
        return "text-[var(--brand)] bg-[var(--brand-50)] border-[var(--brand-100)]";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Demo Management</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">{demos.length} total demos across platform</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                    <input
                        type="text" placeholder="Search demos..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 h-10 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-[var(--muted-text)]">Loading demos...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center">
                        <Film className="w-8 h-8 text-[var(--muted-text)] mx-auto mb-3" />
                        <p className="text-[14px] font-bold text-[var(--body)]">No demos found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-light)] bg-[var(--surface-dim)]">
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Demo</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">User</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-right text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((d) => (
                                <tr key={d.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-[var(--heading)] truncate max-w-[300px]">{d.title || "Untitled"}</p>
                                        <p className="text-[12px] font-medium text-[var(--muted-text)] truncate max-w-[300px] flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {d.url}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-medium text-[var(--body)] font-mono">{d.userId?.slice(0, 12)}...</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border capitalize ${statusColor(d.status)}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
