"use client";

import { Logo } from "@/components/ui/Logo";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Film, BarChart3, Settings, ArrowLeft, Shield, FileText, Briefcase } from "lucide-react";

const adminNav = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Demos", href: "/admin/demos", icon: Film },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "Careers", href: "/admin/careers", icon: Briefcase },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push("/dashboard");
        }
    }, [user, loading, isAdmin, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex font-sans">
            {/* Admin Sidebar */}
            <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-[#EAEAEA]">
                <div className="flex h-16 shrink-0 items-center px-6 border-b border-[#EAEAEA]">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>
                    <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 tracking-wide flex items-center gap-1">
                        <Shield className="w-3 h-3" /> ADMIN
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {adminNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-bold transition-all",
                                    isActive
                                        ? "bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand-100)]"
                                        : "text-[#4a4a4a] hover:bg-[#F5F5F5] hover:text-[#111]"
                                )}
                            >
                                <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[var(--brand)]" : "text-[#999]")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-4 border-t border-[#EAEAEA]">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#4a4a4a] hover:bg-[#F5F5F5] transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:pl-[260px]">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-8 border-b border-[#EAEAEA]">
                    <h1 className="text-[16px] font-bold text-[var(--heading)]">Platform Administration</h1>
                    <span className="text-[13px] font-medium text-[var(--body)]">{user.email}</span>
                </header>
                <main className="p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
