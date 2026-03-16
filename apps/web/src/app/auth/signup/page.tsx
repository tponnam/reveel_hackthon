"use client";

import { Logo } from "@/components/ui/Logo";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, User, ArrowRight, PlayCircle, Zap, Palette, Check } from "lucide-react";

function SignUpContent() {
    const searchParams = useSearchParams();
    const inviteId = searchParams.get("invite") || undefined;
    const invitedEmail = searchParams.get("email") || "";

    const [name, setName] = useState("");
    const [email, setEmail] = useState(invitedEmail);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try { await signUp(email, password, name, inviteId); router.push("/dashboard"); }
        catch (err: any) { setError(err.message || "Failed to create account"); }
        finally { setLoading(false); }
    };

    const handleGoogle = async () => {
        setError("");
        setLoading(true);
        try { await signInWithGoogle(inviteId); router.push("/dashboard"); }
        catch (err: any) { setError(err.message || "Google sign-in failed"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex font-sans">
            {/* Left Panel — Features */}
            <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a2e] text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--brand)]/15 rounded-full blur-[150px]" />
                    <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                    <Link href="/">
                        <Logo />
                    </Link>

                    <div className="flex-1 flex flex-col justify-center space-y-10 max-w-md">
                        <div>
                            <h2 className="text-[40px] font-black leading-tight tracking-tight">
                                Start creating<br />
                                <span className="bg-gradient-to-r from-[var(--brand)] to-purple-400 bg-clip-text text-transparent">incredible demos</span>
                            </h2>
                            <p className="text-white/50 text-[16px] font-medium mt-4 leading-relaxed">
                                Join 500+ product teams already using Reveel AI to generate demo videos from a single URL.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {[
                                { icon: PlayCircle, title: "Zero manual recording", desc: "Provide a URL — our AI agents handle the rest." },
                                { icon: Zap, title: "60-second generation", desc: "From URL to polished video in under a minute." },
                                { icon: Palette, title: "On-brand every time", desc: "Custom logos, voiceover, and captions applied automatically." },
                            ].map((f, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <f.icon className="w-5 h-5 text-[var(--brand)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[15px]">{f.title}</h3>
                                        <p className="text-white/50 text-[13px] leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#1a1a2e]" />
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className="text-yellow-400 text-[12px]">★</span>
                                    ))}
                                </div>
                                <p className="text-[11px] text-white/40 font-medium">Loved by product & marketing teams</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-white relative">
                <Link href="/" className="lg:hidden absolute top-6 left-6"><Logo /></Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-[420px] space-y-7"
                >
                    <div className="space-y-2">
                        <h1 className="text-[32px] font-black text-[var(--heading)] tracking-tight">
                            {inviteId ? "Join your team" : "Create your account"}
                        </h1>
                        <p className="text-[15px] font-medium text-[var(--body)]">
                            {inviteId ? "You've been invited to collaborate on Reveel AI" : "Start generating AI demos in minutes — free"}
                        </p>
                    </div>

                    <div className="space-y-5">
                        <button
                            onClick={handleGoogle}
                            disabled={loading}
                            className="w-full h-12 rounded-xl border border-[#E0E0E0] bg-white hover:bg-[#FAFAFA] text-[var(--heading)] font-bold text-[14px] flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-[#EAEAEA]" />
                            <span className="text-[11px] uppercase font-bold tracking-[0.15em] text-[#AAA]">or</span>
                            <div className="flex-1 h-px bg-[#EAEAEA]" />
                        </div>

                        {error && <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-[13px] font-medium text-red-600">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                                    <input id="name" required placeholder="Sarah Chen" value={name} onChange={e => setName(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 text-[14px] font-medium border border-[#E0E0E0] rounded-xl bg-[#FAFAFA] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                                    <input id="email" type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} readOnly={!!inviteId}
                                        className={`w-full h-12 pl-11 pr-4 text-[14px] font-medium border border-[#E0E0E0] rounded-xl focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all ${inviteId ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-[#FAFAFA]"}`} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                                    <input id="password" type="password" required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 text-[14px] font-medium border border-[#E0E0E0] rounded-xl bg-[#FAFAFA] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full h-12 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-bold text-[15px] transition-all shadow-lg shadow-[var(--brand)]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-1">
                                {loading ? "Joining..." : inviteId ? "Join Team" : "Create Account"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        {!inviteId && (
                            <div className="space-y-2">
                                {["Free forever for up to 5 demos/month", "No credit card required"].map((t, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[12px] font-medium text-[var(--body)]">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" /> {t}
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="text-center text-[13px] font-medium text-[var(--body)]">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-[var(--brand)] hover:underline font-bold">Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" /></div>}>
            <SignUpContent />
        </Suspense>
    );
}
