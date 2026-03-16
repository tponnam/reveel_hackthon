"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link2, Sparkles, Languages, MonitorPlay, MousePointer2, Loader2, Play } from "lucide-react";

const personas = ["Product Manager", "Sales Rep", "New User", "Developer"];
const languages = ["English", "Spanish", "French", "German"];
const resolutions = ["720p", "1080p", "1440p (2K)", "4K"];

export default function GeneratePage() {
    const router = useRouter();
    const { user, orgId } = useAuth();
    const [url, setUrl] = useState("");
    const [prompt, setPrompt] = useState("");
    const [persona, setPersona] = useState("New User");
    const [language, setLanguage] = useState("English");
    const [resolution, setResolution] = useState("1080p");
    const [voiceover, setVoiceover] = useState(true);
    const [captions, setCaptions] = useState(true);
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!url || !user) return;
        setGenerating(true);

        try {
            // 1. Create a document in Firestore so we can track status
            const demoId = Date.now().toString();
            const demoRef = doc(db, "demos", demoId);

            await setDoc(demoRef, {
                id: demoId,
                userId: user.uid,
                url,
                prompt,
                persona,
                language,
                resolution,
                voiceover,
                captions,
                status: "queued",
                progress: 0,
                orgId: orgId || null,
                createdAt: serverTimestamp(),
            });

            // 2. Call the real API route which invokes OrchestratorAgent
            const token = await user.getIdToken();
            const res = await fetch("/api/demos", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: demoId,
                    url,
                    prompt,
                    persona,
                    language,
                    resolution,
                    voiceover,
                    captions,
                    userId: user.uid,
                    orgId: orgId || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.warn("[Generate] API not available, using frontend simulation:", data.error);
                // Fallback: simulate backend processing on the frontend
                simulateBackendProcessing(demoId);
            }

            router.push(`/dashboard/demos/${demoId}`);
        } catch (error) {
            console.error("Error generating demo:", error);
            setGenerating(false);
        }
    };

    // Fallback simulation if API key is not configured yet
    const simulateBackendProcessing = async (demoId: string) => {
        const { updateDoc } = await import("firebase/firestore");
        const docRef = doc(db, "demos", demoId);

        const steps = [
            { status: "analyzing", progress: 10, delay: 2000 },
            { status: "capturing", progress: 30, delay: 4000 },
            { status: "scripting", progress: 50, delay: 3000 },
            { status: "voiceover", progress: 70, delay: 3000 },
            { status: "editing", progress: 85, delay: 3000 },
            { status: "done", progress: 100, delay: 2000 },
        ];

        let i = 0;
        const processStep = async () => {
            if (i >= steps.length) return;
            const step = steps[i];
            const updates: any = { status: step.status, progress: step.progress };
            if (step.status === "done") {
                updates.videoUrl = "https://cdn.coverr.co/videos/coverr-a-person-typing-on-a-laptop-5284/1080p.mp4";
                updates.title = "Reveel Demo Video";
            }
            try { await updateDoc(docRef, updates); } catch { }
            i++;
            setTimeout(processStep, step.delay);
        };

        setTimeout(processStep, 1000);
    };

    return (
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Form Content */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--heading)] mb-2">Configure Agent</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">Define the parameters for the autonomous browser session.</p>
                </div>

                <div className="space-y-8 bg-white p-8 rounded-[24px] border border-[var(--border-light)] shadow-sm">
                    {/* URL Input */}
                    <div className="space-y-3">
                        <label htmlFor="url" className="text-[14px] font-bold text-[var(--heading)] flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-[var(--muted-text)]" /> Target URL <span className="text-[var(--destructive)]">*</span>
                        </label>
                        <input
                            id="url"
                            type="url"
                            placeholder="https://app.example.com/dashboard"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-12 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] placeholder:text-[var(--muted-text)] shadow-sm transition-all outline-none"
                        />
                    </div>

                    {/* Prompt */}
                    <div className="space-y-3">
                        <label htmlFor="prompt" className="text-[14px] font-bold text-[var(--heading)] flex items-center gap-2">
                            <MousePointer2 className="w-4 h-4 text-[var(--muted-text)]" /> Objective Prompt
                        </label>
                        <textarea
                            id="prompt"
                            placeholder="E.g., Navigate to settings, create a new API key, and copy it to the clipboard."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] rounded-xl px-4 py-3 text-[15px] font-medium text-[var(--heading)] placeholder:text-[var(--muted-text)] shadow-sm transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[14px] font-bold text-[var(--heading)] flex items-center gap-2">
                                <Languages className="w-4 h-4 text-[var(--muted-text)]" /> Narration Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-12 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] shadow-sm outline-none cursor-pointer"
                            >
                                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[14px] font-bold text-[var(--heading)] flex items-center gap-2">
                                <MonitorPlay className="w-4 h-4 text-[var(--muted-text)]" /> Export Resolution
                            </label>
                            <select
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-12 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] shadow-sm outline-none cursor-pointer"
                            >
                                {resolutions.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Persona Pills */}
                    <div className="space-y-4 pt-2">
                        <label className="text-[14px] font-bold text-[var(--heading)]">Target Persona / Tone</label>
                        <div className="flex flex-wrap gap-2.5">
                            {personas.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPersona(p)}
                                    className={`px - 4 py - 2 text - [14px] rounded - lg font - bold transition - all border ${persona === p
                                        ? "bg-[var(--brand-50)] text-[var(--brand)] border-[var(--brand-100)] shadow-sm"
                                        : "bg-white text-[var(--body)] border-[var(--border-light)] hover:border-[var(--brand-100)] hover:text-[var(--heading)]"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Premium Toggles */}
                    <div className="flex gap-10 pt-8 border-t border-[var(--border-light)]">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w - [40px] h - [24px] rounded - full transition - colors relative shadow - inner ${voiceover ? "bg-[var(--brand)]" : "bg-[var(--surface-dim)] border border-[var(--border-light)]"} `}
                                onClick={() => setVoiceover(!voiceover)}>
                                <div className={`absolute top - [2px] w - [20px] h - [20px] rounded - full bg - white transition - all shadow - sm ${voiceover ? "left-[18px]" : "left-[2px]"} `} />
                            </div>
                            <span className="text-[15px] font-bold text-[var(--heading)]">Voiceover</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w - [40px] h - [24px] rounded - full transition - colors relative shadow - inner ${captions ? "bg-[var(--brand)]" : "bg-[var(--surface-dim)] border border-[var(--border-light)]"} `}
                                onClick={() => setCaptions(!captions)}>
                                <div className={`absolute top - [2px] w - [20px] h - [20px] rounded - full bg - white transition - all shadow - sm ${captions ? "left-[18px]" : "left-[2px]"} `} />
                            </div>
                            <span className="text-[15px] font-bold text-[var(--heading)]">Captions</span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!url || generating}
                    className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white h-14 rounded-xl text-[16px] font-bold shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(96,46,223,0.23)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                    {generating ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Initializing Agent...</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> Start Generation</>
                    )}
                </button>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-[12px] font-black text-[var(--muted-text)] mb-4 uppercase tracking-[0.1em]">Plan Limits</h3>
                    <div className="w-full bg-[var(--surface-dim)] h-2 rounded-full mb-3 overflow-hidden shadow-inner border border-[var(--border-light)]">
                        <div className="bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] w-[15%] h-full rounded-full" />
                    </div>
                    <p className="text-[14px] font-bold text-[var(--heading)]">0 / 2 mins used</p>
                    <p className="text-[13px] font-medium text-[var(--body)] mt-3 leading-relaxed">Upgrade to Pro for 4K exports, unlimited limits, and custom intros.</p>
                    <button className="mt-5 w-full bg-white hover:bg-[var(--surface-dim)] border border-[var(--border-light)] text-[var(--heading)] h-10 rounded-xl text-[14px] font-bold transition-all shadow-sm hover:border-[var(--brand-100)]">
                        Upgrade Plan
                    </button>
                </div>

                <div className="bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <h3 className="text-[14px] font-bold text-[var(--brand)] mb-3 flex items-center gap-2 relative z-10">
                        <Play className="w-4 h-4 fill-[var(--brand)] stroke-[var(--brand)]" />
                        How it works
                    </h3>
                    <p className="text-[13px] font-medium text-[var(--brand-dark)] leading-relaxed relative z-10">
                        The agent spins up a headless browser, executes your prompt directly in the DOM, records video, and passes interaction logs to Gemini for script generation.
                    </p>
                </div>
            </div>
        </div>
    );
}
