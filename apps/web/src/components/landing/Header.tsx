"use client";

import { Logo } from "@/components/ui/Logo";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const { user } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 flex justify-center pointer-events-none">
            <motion.div
                className={`pointer-events-auto flex items-center justify-between transition-all duration-500 w-full max-w-5xl ${isScrolled ? "bg-white/90 backdrop-blur-md px-6 py-3 border border-black/5 rounded-full shadow-sm" : "bg-transparent px-2 py-2"
                    }`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <Link href="/" className="group">
                    <Logo />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 bg-[var(--surface-dim)]/50 px-6 py-2.5 rounded-full border border-black/5">
                    <Link href="#features" className="text-sm font-semibold text-[var(--body)] hover:text-[var(--brand)] transition-colors">Platform</Link>
                    <Link href="#how-it-works" className="text-sm font-semibold text-[var(--body)] hover:text-[var(--brand)] transition-colors">How it Works</Link>
                    <Link href="#pricing" className="text-sm font-semibold text-[var(--body)] hover:text-[var(--brand)] transition-colors">Pricing</Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <Button render={<Link href="/dashboard" />} className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-bold rounded-full h-10 px-6 shadow-[0_4px_14px_0_rgba(96,46,223,0.39)]">
                            Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button render={<Link href="/auth/signin" />} variant="ghost" className="text-[var(--heading)] font-semibold hover:bg-[var(--surface-dim)] rounded-full h-10 px-5">
                                Sign In
                            </Button>
                            <Button render={<Link href="/auth/signup" />} className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-bold rounded-full h-10 px-6 shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(96,46,223,0.23)] hover:-translate-y-0.5">
                                Get Started
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-[var(--heading)] p-2" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="w-6 h-6 stroke-[2]" />
                </button>
            </motion.div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl p-6 pointer-events-auto flex flex-col"
                    >
                        <div className="flex justify-end">
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[var(--surface-dim)] rounded-full text-[var(--heading)]">
                                <X className="w-6 h-6 stroke-[2]" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-6 mt-12 text-center text-2xl font-black text-[var(--heading)]">
                            <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Platform</Link>
                            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
                            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                        </nav>
                        <div className="mt-auto flex flex-col gap-4 pb-10">
                            {user ? (
                                <Button render={<Link href="/dashboard" />} className="w-full bg-[var(--brand)] text-white font-bold h-14 rounded-2xl text-lg">
                                    Go to Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Button render={<Link href="/auth/signup" />} className="w-full bg-[var(--brand)] text-white font-bold h-14 rounded-2xl text-lg">
                                        Get Started Free
                                    </Button>
                                    <Button render={<Link href="/auth/signin" />} variant="outline" className="w-full font-bold h-14 rounded-2xl text-lg border-[var(--border-light)]">
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
