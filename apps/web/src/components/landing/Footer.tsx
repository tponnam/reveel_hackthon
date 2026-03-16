import Link from "next/link";
import { Twitter, Github, Linkedin, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const productLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Changelog", href: "/changelog" },
];

const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
];

const legalLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/privacy#dpa" },
    { label: "DPA", href: "/privacy#dpa" },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-[var(--border-light)]">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10">
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <Logo />
                        </Link>
                        <p className="text-sm text-[var(--body)] leading-relaxed max-w-xs mb-6">The AI demo agent for modern product teams. Turn your URL into studio-quality videos.</p>
                        {/* Compliance badges */}
                        <div className="flex items-center gap-3">
                            {["SOC 2", "GDPR", "ISO 27001"].map(b => (
                                <span key={b} className="text-[10px] font-bold text-[var(--heading)] px-2.5 py-1 border border-[var(--border-light)] bg-[var(--surface-dim)] rounded-md">{b}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--heading)] mb-4">Product</h4>
                        <ul className="space-y-3">
                            {productLinks.map(link => (
                                <li key={link.label}><Link href={link.href} className="text-sm text-[var(--body)] font-medium hover:text-[var(--brand)] transition-colors">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--heading)] mb-4">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map(link => (
                                <li key={link.label}><Link href={link.href} className="text-sm text-[var(--body)] font-medium hover:text-[var(--brand)] transition-colors">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--heading)] mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {legalLinks.map(link => (
                                <li key={link.label}><Link href={link.href} className="text-sm text-[var(--body)] font-medium hover:text-[var(--brand)] transition-colors">{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-[var(--border-dim)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--muted-text)] font-medium">© 2026 Reveel AI. All rights reserved.</p>
                    <div className="flex items-center gap-5">
                        <a href="#" className="text-[var(--muted-text)] hover:text-[var(--brand)] transition-colors"><Twitter className="w-4 h-4" /></a>
                        <a href="#" className="text-[var(--muted-text)] hover:text-[var(--heading)] transition-colors"><Github className="w-4 h-4" /></a>
                        <a href="#" className="text-[var(--muted-text)] hover:text-[#0A66C2] transition-colors"><Linkedin className="w-4 h-4" /></a>
                        <a href="#" className="text-[var(--muted-text)] hover:text-[#5865F2] transition-colors"><MessageCircle className="w-4 h-4" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
