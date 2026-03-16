"use client";

import { useAuth } from "@/lib/auth-context";
import { UserCircle, CreditCard, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">

            <div className="space-y-8">
                {/* Profile */}
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <UserCircle className="w-5 h-5 text-[var(--muted-text)]" />
                            Personal Details
                        </h3>
                        <p className="text-[14px] text-[var(--body)] font-medium leading-relaxed">Your personal information and email connected to this account.</p>
                    </div>
                    <div className="md:w-2/3 p-8 space-y-6">
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">Full Name</label>
                            <input defaultValue={user?.displayName || ""} className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-100)] focus:border-[var(--brand)] h-11 rounded-xl px-4 text-[15px] font-medium text-[var(--heading)] shadow-sm outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] mb-2 block uppercase tracking-wide">Email Address</label>
                            <input value={user?.email || ""} readOnly className="w-full bg-[var(--surface-dim)] border border-[var(--border-light)] text-[var(--muted-text)] h-11 rounded-xl px-4 text-[15px] font-medium cursor-not-allowed outline-none opacity-70" />
                        </div>
                        <div className="pt-4">
                            <button className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white h-11 px-6 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(96,46,223,0.23)]">
                                Save Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription */}
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <CreditCard className="w-5 h-5 text-[var(--muted-text)]" />
                            Billing
                        </h3>
                        <p className="text-[14px] text-[var(--body)] font-medium leading-relaxed">Manage your Reveel AI subscription and usage limits.</p>
                    </div>
                    <div className="md:w-2/3 p-8 space-y-6">
                        <div className="bg-[var(--surface-dim)] border border-[var(--border-light)] rounded-2xl p-6 flex items-center justify-between shadow-inner">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand-100)] text-[11px] font-extrabold uppercase tracking-widest mb-3">Free Trial</span>
                                <p className="text-[18px] font-bold text-[var(--heading)]">Current Plan</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[24px] font-bold text-[var(--heading)]">$0.00 <span className="text-[14px] font-bold text-[var(--muted-text)]">/ month</span></p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--border-light)]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[15px] font-bold text-[var(--heading)]">Unlock Pro Features</p>
                                    <p className="text-[14px] text-[var(--body)] font-medium mt-1">Need 4K exports and API access?</p>
                                </div>
                                <button className="bg-white border border-[var(--border-light)] hover:border-[var(--brand-100)] text-[var(--heading)] h-11 px-6 rounded-xl text-[14px] font-bold shadow-sm transition-all hover:bg-[var(--surface-dim)] whitespace-nowrap">
                                    Upgrade Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="bg-white border border-red-200 rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="md:w-1/3 bg-red-50/50 md:border-r border-b md:border-b-0 border-red-100 p-8 relative z-10">
                        <h3 className="text-[15px] font-bold text-red-600 flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </h3>
                        <p className="text-[14px] text-red-700/80 font-medium leading-relaxed">Irreversible actions for your account.</p>
                    </div>
                    <div className="md:w-2/3 p-8 flex flex-col justify-center items-start relative z-10">
                        <p className="text-[15px] text-[var(--heading)] font-semibold mb-6">
                            Permanently delete your account, generated videos, and branding settings.
                        </p>
                        <button className="bg-white border border-red-200 text-red-600 hover:bg-red-50 h-11 px-6 rounded-xl text-[14px] font-bold transition-colors shadow-sm">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
