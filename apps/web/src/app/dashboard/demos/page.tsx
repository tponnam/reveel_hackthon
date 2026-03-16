"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Plus, Play, Download, Trash2, Clock, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";

interface DemoData {
    id: string;
    url: string;
    status: string;
    progress: number;
    title?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    createdAt: any;
}

export default function DemosPage() {
    const { user, orgId } = useAuth();
    const [demos, setDemos] = useState<DemoData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        let q;
        if (orgId) {
            q = query(
                collection(db, "demos"),
                where("orgId", "==", orgId)
            );
        } else {
            q = query(
                collection(db, "demos"),
                where("userId", "==", user.uid)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => doc.data() as DemoData);

            // Client-side sorting
            fetched.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
                const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
                return dateB - dateA;
            });

            setDemos(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, orgId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this demo?") || !user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/demos/${id}`, { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete demo");
            }
        } catch (error: any) {
            console.error("Delete error:", error);
            alert("Delete failed: " + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-6">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Library</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">Manage and export your generated demo videos.</p>
                </div>
                <button className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white h-11 px-6 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(96,46,223,0.23)] flex items-center justify-center">
                    <Link href="/dashboard/generate" className="flex items-center gap-2">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        New Demo
                    </Link>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-text)]">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-[14px] font-bold">Loading your library...</p>
                </div>
            ) : demos.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {demos.map((demo) => {
                        const isGenerating = demo.status !== "done" && demo.status !== "error";
                        return (
                            <div key={demo.id} className="group bg-white rounded-3xl border border-[var(--border-light)] overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col">
                                <Link href={`/dashboard/demos/${demo.id}`} className="block flex-1">
                                    <div className="aspect-video bg-[var(--surface-dim)] relative flex items-center justify-center overflow-hidden border-b border-[var(--border-light)]">
                                        {isGenerating ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--brand-50)] text-[var(--brand)]">
                                                <Sparkles className="w-8 h-8 mb-3 animate-pulse" />
                                                <p className="text-[14px] font-bold capitalize mb-2">{demo.status}...</p>
                                                <div className="w-3/4 bg-white/50 h-2 rounded-full overflow-hidden border border-[var(--brand-100)]">
                                                    <div
                                                        className="bg-[var(--brand)] h-full transition-all duration-500 ease-out rounded-full"
                                                        style={{ width: `${demo.progress || 0}%` }}
                                                    />
                                                </div>
                                                <p className="text-[11px] font-black mt-2">{demo.progress || 0}%</p>
                                            </div>
                                        ) : demo.status === "error" ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-500">
                                                <AlertCircle className="w-8 h-8 mb-2" />
                                                <p className="text-[13px] font-bold">Generation Failed</p>
                                            </div>
                                        ) : (
                                            <>
                                                {demo.thumbnailUrl ? (
                                                    <img src={demo.thumbnailUrl} alt={demo.title || "Demo thumbnail"} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)] to-purple-900 opacity-40 group-hover:scale-105 transition-transform duration-700" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                {demo.videoUrl && (
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white group-hover:bg-[var(--brand)] group-hover:border-[var(--brand)] transition-colors cursor-pointer relative z-10 shadow-lg shadow-black/20">
                                                        <Play className="w-5 h-5 ml-1 fill-white" />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="p-5 pb-0 bg-white">
                                        <div className="flex flex-col mb-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-[16px] text-[var(--heading)] truncate pr-4 group-hover:text-[var(--brand)] transition-colors">
                                                    {demo.title || "Untitled Demo"}
                                                </h3>
                                                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isGenerating ? "bg-[var(--brand-50)] text-[var(--brand)] animate-pulse" : "bg-[#F5F5F5] text-[#666]"
                                                    }`}>
                                                    <Clock className="w-3 h-3" /> {isGenerating ? "Processing" : "Ready"}
                                                </span>
                                            </div>
                                            <p className="text-[13px] text-[var(--body)] font-medium line-clamp-1">{demo.url}</p>
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-5 pb-5 mt-auto bg-white">
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] pb-1 relative z-20">
                                        <a href={demo.videoUrl || "#"} target={demo.videoUrl ? "_blank" : "_self"} className={`flex items-center gap-2 text-[13px] font-bold transition-colors ${!isGenerating && demo.status !== "error" ? "text-[var(--body)] hover:text-[var(--brand)]" : "text-[var(--muted-text)] opacity-50 pointer-events-none"}`}>
                                            <Download className="w-4 h-4" /> Export
                                        </a>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDelete(demo.id); }}
                                            className="text-[var(--body)] hover:text-[var(--destructive)] transition-colors p-1 relative z-20"
                                            title="Delete demo"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="border hover:border-[var(--brand-200)] hover:shadow-md transition-all border-[var(--border-light)] rounded-3xl bg-white flex flex-col items-center justify-center py-32 px-4 text-center shadow-sm">
                    <div className="w-16 h-16 mb-6 rounded-2xl bg-[var(--surface-dim)] border border-[var(--border-light)] flex items-center justify-center shadow-inner">
                        <Film className="w-6 h-6 text-[var(--brand)] stroke-[2]" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[var(--heading)] mb-2">No demos generated</h3>
                    <p className="text-[15px] text-[var(--body)] font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                        Start your first autonomous recording session to generate a branded video.
                    </p>
                    <button className="bg-white border border-[var(--border-light)] hover:border-[var(--brand-100)] hover:bg-[var(--surface-dim)] text-[var(--heading)] h-11 px-6 rounded-xl text-[14px] font-bold shadow-sm transition-all box-border">
                        <Link href="/dashboard/generate" className="flex items-center justify-center">Generate Now</Link>
                    </button>
                </div>
            )}
        </div>
    );
}
