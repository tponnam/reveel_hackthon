"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserCircle, Users } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { label: "Profile & Billing", href: "/dashboard/settings/profile", icon: UserCircle },
        { label: "Team & Workspace", href: "/dashboard/settings/team", icon: Users },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="border-b border-[var(--border-light)] pb-2 flex items-end gap-6">
                <div className="flex-1 pb-4">
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Account & Team</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">Manage your preferences and workspace members.</p>
                </div>

                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-[14px] font-bold transition-all relative top-[3px]",
                                    isActive
                                        ? "bg-white border-t border-x border-[var(--border-light)] text-[var(--brand)] shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"
                                        : "text-[var(--body)] hover:text-[var(--heading)] hover:bg-[#FAFAFA]"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {isActive && <div className="absolute -bottom-[3px] left-0 right-0 h-[3px] bg-white" />}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="pt-2">
                {children}
            </div>
        </div>
    );
}
