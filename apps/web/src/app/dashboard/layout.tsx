"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Logo } from "@/components/ui/Logo";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    Zap,
    Video,
    Palette,
    Settings,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Shield,
    CreditCard,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

// The ultra-premium linear-style sidebar
const sidebarLinks = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "New Demo", href: "/dashboard/generate", icon: Zap },
    { label: "Library", href: "/dashboard/demos", icon: Video },
    { label: "Brand Kit", href: "/dashboard/brand-kit", icon: Palette },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({
    pathname,
    isExpanded,
    isAdmin,
    onToggle
}: {
    pathname: string;
    isExpanded: boolean;
    isAdmin: boolean;
    onToggle?: () => void;
}) {
    return (
        <div className="flex flex-col h-full bg-white border-r border-[#EAEAEA]">
            {/* Sleek Minimal Logo */}
            <div className={cn("flex h-16 shrink-0 items-center justify-between transition-all duration-300", isExpanded ? "px-6" : "px-0 justify-center")}>
                <Link href="/" className="flex items-center gap-2">
                    <Logo iconOnly={!isExpanded} />
                </Link>
            </div>

            {/* Navigation list */}
            <nav className={cn("flex-1 overflow-y-auto py-5 space-y-1", isExpanded ? "px-3" : "px-2")}>
                {sidebarLinks.map(link => {
                    const active = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link key={link.href} href={link.href}
                            title={!isExpanded ? link.label : undefined}
                            className={cn(
                                "flex items-center rounded-xl text-[14px] font-semibold transition-all group",
                                isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5 mx-auto",
                                active ? "text-[var(--brand)] bg-[#F3E8FF]" : "text-[#4a4a4a] hover:bg-[#FAFAFA]"
                            )}>
                            <Icon className={cn("shrink-0 stroke-[2]", isExpanded ? "w-5 h-5" : "w-5 h-5", active ? "text-[var(--brand)]" : "text-[#737373]")} />
                            {isExpanded && <span className="truncate">{link.label}</span>}
                        </Link>
                    );
                })}

                {/* Admin-only Routes */}
                {isAdmin && (
                    <>
                        <div className={cn("pt-4 pb-2", isExpanded ? "px-3" : "px-0 text-center")}>
                            <div className={cn("text-[10px] font-black uppercase tracking-wider text-[#A1A1AA]", !isExpanded && "sr-only")}>Platform Admin</div>
                            {!isExpanded && <div className="w-4 h-[1px] bg-[#EAEAEA] mx-auto mt-2" />}
                        </div>

                        <Link href="/admin/billing"
                            title={!isExpanded ? "Billing Admin" : undefined}
                            className={cn(
                                "flex items-center rounded-xl text-[14px] font-semibold transition-all group",
                                isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5 mx-auto",
                                pathname === "/admin/billing" ? "text-amber-700 bg-amber-50 border border-amber-100" : "text-[#4a4a4a] hover:bg-[#FAFAFA]"
                            )}>
                            <CreditCard className={cn("shrink-0 stroke-[2]", isExpanded ? "w-5 h-5" : "w-5 h-5", pathname === "/admin/billing" ? "text-amber-600" : "text-[#737373]")} />
                            {isExpanded && <span className="truncate">Billing Settings</span>}
                        </Link>

                        <Link href="/admin/support"
                            title={!isExpanded ? "Support Admin" : undefined}
                            className={cn(
                                "flex items-center rounded-xl text-[14px] font-semibold transition-all group mt-1",
                                isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5 mx-auto",
                                pathname === "/admin/support" ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-[#4a4a4a] hover:bg-[#FAFAFA]"
                            )}>
                            <MessageSquare className={cn("shrink-0 stroke-[2]", isExpanded ? "w-5 h-5" : "w-5 h-5", pathname === "/admin/support" ? "text-emerald-600" : "text-[#737373]")} />
                            {isExpanded && <span className="truncate">Customer Support</span>}
                        </Link>
                    </>
                )}
            </nav>

            {/* Toggle Button for Collapsed State (Bottom) */}
            {onToggle && (
                <div className={cn("border-t border-[#EAEAEA] p-4 flex", isExpanded ? "justify-between items-center" : "justify-center")}>
                    {isExpanded && <span className="text-xs font-bold text-[#888] tracking-wider uppercase">Unlock Sider</span>}
                    <button onClick={onToggle} className="p-2 rounded-lg text-[#888] hover:text-[#111] hover:bg-[#FAFAFA] transition-colors" title="Toggle Sidebar">
                        {isExpanded ? <PanelLeftClose className="w-5 h-5 stroke-[2]" /> : <PanelLeftOpen className="w-5 h-5 stroke-[2]" />}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => { if (!loading && !user) router.push("/auth/signin"); }, [user, loading, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!user) return null;

    return (
        <div className="min-h-screen bg-white flex font-sans selection:bg-[var(--brand-200)] selection:text-[var(--brand-dark)]">
            {/* Desktop Sidebar */}
            <aside className={cn("hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white transition-all duration-300 ease-in-out", isSidebarExpanded ? "w-[260px]" : "w-[72px]")}>
                <SidebarContent
                    pathname={pathname}
                    isExpanded={isSidebarExpanded}
                    isAdmin={isAdmin}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                />
            </aside>

            {/* Main Content Wrapper */}
            <div className={cn("flex-1 flex flex-col min-h-screen relative transition-all duration-300 ease-in-out", isSidebarExpanded ? "lg:pl-[260px]" : "lg:pl-[72px]")}>
                {/* Sleek Top Navbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 sm:px-8 border-b border-[#EAEAEA]">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-[#111] hover:bg-[#FAFAFA]" />}>
                                <Menu className="w-5 h-5" />
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[260px] p-0 border-r-0 bg-white">
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                                {/* Mobile sidebar is always expanded by default */}
                                <SidebarContent pathname={pathname} isExpanded={true} isAdmin={isAdmin} />
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex flex-1 justify-end items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                className="rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all block"
                            >
                                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EAEAEA] cursor-pointer hover:ring-2 hover:ring-[var(--brand-100)] transition-all">
                                    <AvatarFallback title="Profile Menu" className="bg-[#EAEAEA] text-[#4a4a4a] text-sm font-bold uppercase">
                                        {user?.displayName ? user.displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : (user?.email?.[0] || "U")}
                                    </AvatarFallback>
                                </Avatar>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 bg-white border border-[#EAEAEA] rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right font-sans"
                                    >
                                        <div className="p-4 border-b border-[#EAEAEA] bg-[#FAFAFA]/50">
                                            <p className="text-[14px] font-bold text-[#111] truncate">{user.displayName || "User"}</p>
                                            <p className="text-[12px] font-medium text-[#666] truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <Link href="/dashboard/settings" className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-bold text-[#4a4a4a] hover:bg-[#FAFAFA] hover:text-[#111] rounded-xl transition-colors">
                                                <Settings className="w-4 h-4 text-[#888]" />
                                                Account Settings
                                            </Link>
                                            {isAdmin && (
                                                <Link href="/admin" className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                                                    <Shield className="w-4 h-4 text-amber-500" />
                                                    Admin Console
                                                </Link>
                                            )}
                                            <button onClick={signOut} className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                                <LogOut className="w-4 h-4 text-red-500" />
                                                Log Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 sm:p-12 relative overflow-y-auto">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
