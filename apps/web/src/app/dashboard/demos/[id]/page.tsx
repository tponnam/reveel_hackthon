"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowLeft, Play, Sparkles, AlertCircle, Clock, Link as LinkIcon, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface DemoData {
    id: string;
    url: string;
    status: string;
    progress: number;
    title?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    script?: string;
    duration?: number;
    createdAt: any;
}

export default function DemoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    // In Next.js 15+, params is a Promise that must be unwrapped
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const [demo, setDemo] = useState<DemoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editedScript, setEditedScript] = useState("");
    const [isApproving, setIsApproving] = useState(false);

    useEffect(() => {
        if (demo?.script && !editedScript) {
            setEditedScript(demo.script);
        }
    }, [demo?.script, editedScript]);

    useEffect(() => {
        if (!id) return;

        console.log("Listening to demo:", id);
        const unsubscribe = onSnapshot(doc(db, "demos", id as string), (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as DemoData;
                setDemo(data);
                if (data.status !== "awaiting_approval") {
                    setIsApproving(false);
                }
            } else {
                setDemo(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching demo:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    const handleApproveScript = async () => {
        if (!demo || !user) return;
        setIsApproving(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/demos/${demo.id}/approve`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ script: editedScript }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to approve script");
            }
        } catch (error: any) {
            console.error(error);
            alert("Approval failed: " + error.message);
            setIsApproving(false);
        }
    };
    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
            </div>
        );
    }

    if (!demo) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <Link href="/dashboard/demos" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-black mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Library
                </Link>
                <div className="bg-white rounded-3xl border border-[var(--border-light)] p-12 text-center">
                    <h2 className="text-2xl font-bold mb-2">Demo not found</h2>
                    <p className="text-[var(--text-secondary)] mb-6">The demo you are looking for does not exist or has been deleted.</p>
                    <Link href="/dashboard/generate" className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand)] text-white font-medium rounded-xl hover:bg-black transition-colors">
                        Create New Demo
                    </Link>
                </div>
            </div>
        );
    }

    const isGenerating = demo.status !== "done" && demo.status !== "error";

    return (
        <div className="p-8 max-w-6xl mx-auto pb-24">
            <Link href="/dashboard/demos" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-black mb-8 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${(isGenerating && demo.status !== "awaiting_approval") ? "bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand-100)] opacity-90 animate-pulse" :
                        demo.status === "awaiting_approval" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            demo.status === "error" ? "bg-red-50 text-red-600 border border-red-100" :
                                "bg-green-50 text-emerald-600 border border-green-100"
                        }`}>
                        {demo.status === "awaiting_approval" ? "Action Required" : isGenerating ? "Processing" : demo.status === "done" ? "Ready" : "Failed"}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center">
                        <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                        {new URL(demo.url).hostname}
                    </span>
                    {demo.duration && demo.status === "done" && (
                        <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center before:content-['•'] before:mx-3 before:text-gray-300">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            ~{Math.round(demo.duration / 60)} min
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-black text-black">
                    {demo.title || "Untitled Demo"}
                </h1>
            </div>

            <div className="flex flex-col gap-8">
                {/* Main Content (Player or Progress) */}
                <div className="w-full space-y-6">
                    {/* Video Player / Progress Card */}
                    <div className="bg-white rounded-[2rem] border border-[var(--border-light)] overflow-hidden shadow-sm">

                        {isGenerating ? (
                            <div className="aspect-video bg-[var(--surface-dim)] relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[var(--brand-50)] to-white border-b border-[var(--border-light)] z-20">
                                {demo.status === "awaiting_approval" ? (
                                    <div className="w-full text-left bg-white rounded-2xl p-6 border border-[var(--border-light)] shadow-sm relative z-10 max-w-2xl mb-8">
                                        <h3 className="text-xl font-bold mb-2">Review AI Script</h3>
                                        <p className="text-[var(--text-secondary)] mb-4 text-sm">
                                            Please review and edit the generated narration script below. We will synthesize the voiceover once you approve.
                                        </p>
                                        <textarea
                                            value={editedScript}
                                            onChange={(e) => setEditedScript(e.target.value)}
                                            className="w-full h-48 p-4 rounded-xl border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand)] outline-none resize-none mb-4 text-black font-medium leading-relaxed bg-[#fbfbfb]"
                                            disabled={isApproving}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleApproveScript}
                                                disabled={isApproving}
                                                className="px-6 py-3 bg-[var(--brand)] text-white font-medium rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                                            >
                                                {isApproving ? "Approving..." : "Approve & Synthesize"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 relative border border-[var(--border-light)] z-10">
                                            <div className="absolute inset-0 rounded-full border-2 border-[var(--brand)] border-t-transparent animate-spin opacity-20"></div>
                                            <Sparkles className="w-8 h-8 text-[var(--brand)] animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Generating your demo...</h3>
                                        <p className="text-[var(--text-secondary)] mb-8 max-w-sm text-sm">
                                            Our AI is currently navigating your website, recording the visuals, and synthesizing the voiceover.
                                        </p>
                                    </>
                                )}

                                {/* Progress Bar */}
                                <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-[var(--border-light)] relative z-10">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-sm font-bold uppercase tracking-wider text-[var(--brand)]">
                                            {demo.status === "awaiting_approval" ? "PAUSED FOR APPROVAL" : demo.status}
                                        </span>
                                        <span className="text-2xl font-black text-black">{demo.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-[var(--surface-dim)] h-3 rounded-full overflow-hidden border border-[var(--border-light)]">
                                        <div
                                            className="bg-[var(--brand)] h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden"
                                            style={{ width: `${demo.progress || 0}%` }}
                                        >
                                            <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-5 text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                        <div className={`transition-colors ${demo.progress >= 20 ? 'text-black' : ''}`}>Plan</div>
                                        <div className={`transition-colors ${demo.progress >= 40 ? 'text-black' : ''}`}>Record</div>
                                        <div className={`transition-colors ${demo.progress >= 60 ? 'text-black' : ''}`}>Script</div>
                                        <div className={`transition-colors ${demo.progress >= 80 ? 'text-black' : ''}`}>Voice</div>
                                        <div className={`transition-colors ${demo.progress >= 100 ? 'text-black' : ''}`}>Merge</div>
                                    </div>
                                </div>

                                {/* Decorative background elements for wait screen */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
                            </div>
                        ) : demo.status === "error" ? (
                            <div className="aspect-video bg-[var(--surface-dim)] flex flex-col items-center justify-center border-b border-[var(--border-light)] text-center p-8 bg-gradient-to-br from-red-50 to-white">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
                                <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                                    {demo.error || "An unexpected error occurred during the video assembly pipeline."}
                                </p>
                                <Link href="/dashboard/generate" className="px-6 py-2.5 bg-white border border-[var(--border-light)] rounded-xl font-medium shadow-sm hover:border-[var(--brand)] transition-colors">
                                    Try again
                                </Link>
                            </div>
                        ) : (
                            <div className="aspect-video bg-black relative group overflow-hidden">
                                {demo.videoUrl ? (
                                    <video
                                        src={demo.videoUrl}
                                        controls
                                        poster={demo.thumbnailUrl}
                                        className="w-full h-full object-contain"
                                        controlsList="nodownload"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                        <p>Video URL not found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Metadata Footer */}
                        <div className="p-5 bg-white flex items-center justify-between border-t border-[var(--border-light)]">
                            <div className="flex items-center text-sm font-medium text-[var(--text-secondary)]">
                                <span>Generated on {demo.createdAt?.toDate ? demo.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button className="p-2 text-[var(--text-secondary)] hover:text-black hover:bg-[var(--surface-dim)] rounded-lg transition-colors border border-transparent hover:border-[var(--border-light)]" title="Share Demo">
                                    <Share2 className="w-4 h-4" />
                                </button>
                                {demo.videoUrl && demo.status === "done" && (
                                    <a
                                        href={demo.videoUrl}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-[var(--surface-dim)] border border-[var(--border-light)] rounded-lg text-sm font-bold hover:border-black transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download MP4
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section (Script & Details) */}
                <div className="w-full">
                    <div className="bg-white rounded-[2rem] border border-[var(--border-light)] p-8 shadow-sm flex flex-col">
                        <h3 className="font-bold text-lg mb-6 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-[var(--brand)]" />
                            AI Narration Script
                        </h3>

                        {isGenerating && demo.status !== "awaiting_approval" ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] p-6 bg-[var(--surface-dim)] rounded-xl border border-[var(--border-light)] border-dashed">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                                    <Sparkles className="w-5 h-5 opacity-50" />
                                </div>
                                <p className="text-sm">The script is currently being synthesized by Gemini 1.5 Pro.</p>
                            </div>
                        ) : demo.status === "error" ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] p-6 bg-[var(--surface-dim)] rounded-xl border border-[var(--border-light)] border-dashed">
                                <p className="text-sm">No script available.</p>
                            </div>
                        ) : (
                            <div className="flex-1 bg-[var(--surface-dim)] rounded-xl p-6 border border-[var(--border-light)] shadow-inner overflow-y-auto max-h-[500px]">
                                {demo.script ? (
                                    <div className="prose prose-sm prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed">
                                        {demo.script.split('\n\n').map((paragraph, idx) => (
                                            <p key={idx} className="mb-4 last:mb-0 border-l-2 border-[var(--brand-100)] pl-4 py-1.5 whitespace-pre-wrap font-medium">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-secondary)] text-center font-medium italic py-8">
                                        No narration script was generated for this demo.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
