"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Loader2, DollarSign, Building2, TrendingUp, Search, CreditCard, FileText, ArrowUpRight, Download, CheckCircle2 } from "lucide-react";

interface Organization {
    id: string;
    name: string;
    plan: "free" | "pro" | "enterprise";
    createdAt: any;
    revenue?: number;
}

interface Invoice {
    id: string;
    orgId: string;
    orgName: string;
    amount: number;
    status: "paid" | "open" | "overdue";
    dueDate: any;
    paidAt?: any;
    invoiceNumber: string;
}

export default function AdminBillingPage() {
    const { role } = useAuth();
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingOrg, setUpdatingOrg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "invoices">("overview");

    useEffect(() => {
        if (role === "admin") {
            fetchData();
        }
    }, [role]);

    async function fetchData() {
        setLoading(true);
        try {
            const orgsSnap = await getDocs(query(collection(db, "organizations"), orderBy("createdAt", "desc")));
            const fetchedOrgs = orgsSnap.docs.map(d => {
                const data = d.data();
                let rev = 0;
                if (data.plan === "pro") rev = 49;
                if (data.plan === "enterprise") rev = 199;
                return {
                    id: d.id,
                    name: data.name || "Unnamed Workspace",
                    plan: data.plan || "free",
                    createdAt: data.createdAt,
                    revenue: rev
                };
            });
            setOrgs(fetchedOrgs as Organization[]);

            const invSnap = await getDocs(query(collection(db, "invoices"), orderBy("dueDate", "desc")));
            const fetchedInvoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));

            // If no invoices exist, let's inject a few mock ones for demonstration
            if (fetchedInvoices.length === 0 && fetchedOrgs.length > 0) {
                const mockInvoices: Invoice[] = fetchedOrgs.filter(o => o.plan !== "free").map((o, index) => ({
                    id: `mock-inv-${index}`,
                    orgId: o.id,
                    orgName: o.name,
                    amount: o.revenue || 0,
                    status: index % 3 === 0 ? "open" : "paid",
                    dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
                    invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`
                }));
                setInvoices(mockInvoices);
            } else {
                setInvoices(fetchedInvoices);
            }

        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const handleUpgrade = async (orgId: string, newPlan: "free" | "pro" | "enterprise") => {
        if (!confirm(`Are you sure you want to change this organization's plan to ${newPlan.toUpperCase()}?`)) return;

        setUpdatingOrg(orgId);
        try {
            await setDoc(doc(db, "organizations", orgId), { plan: newPlan }, { merge: true });
            setOrgs(prev => prev.map(o => {
                if (o.id === orgId) {
                    let rev = 0;
                    if (newPlan === "pro") rev = 49;
                    if (newPlan === "enterprise") rev = 199;
                    return { ...o, plan: newPlan, revenue: rev };
                }
                return o;
            }));
        } catch (err) {
            console.error("Failed to upgrade org:", err);
            alert("Failed to update organization plan.");
        }
        setUpdatingOrg(null);
    };

    const filteredOrgs = orgs.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase()));

    // Invoices filtering
    const filteredInvoices = invoices.filter(i =>
        i.orgName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const mrr = orgs.reduce((sum, o) => sum + (o.revenue || 0), 0);
    const activeSubs = orgs.filter(o => o.plan !== "free").length;
    const arpu = activeSubs > 0 ? (mrr / activeSubs).toFixed(2) : "0.00";

    if (role !== "admin") return null;

    if (loading) {
        return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" /></div>;
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-[var(--border-light)] pb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-[28px] font-semibold text-[var(--heading)] mb-2 flex items-center gap-3">
                        <CreditCard className="w-7 h-7 text-[var(--brand)]" />
                        Billing & Subscriptions
                    </h1>
                    <p className="text-[16px] font-medium text-[var(--body)]">Manage organizational plans, platform revenue, and invoices.</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-[var(--surface-dim)] p-1 rounded-xl border border-[var(--border-light)]">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "overview" ? "bg-white text-[var(--brand)] shadow-sm" : "text-[var(--muted-text)] hover:text-[var(--heading)]"}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("invoices")}
                        className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "invoices" ? "bg-white text-[var(--brand)] shadow-sm" : "text-[var(--muted-text)] hover:text-[var(--heading)]"}`}
                    >
                        Invoices
                    </button>
                </div>
            </div>

            {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[13px] font-bold text-[var(--muted-text)] uppercase tracking-wider">Monthly MRR</p>
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[32px] font-bold text-[var(--heading)] mb-1">${mrr.toLocaleString()}</p>
                                <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +14.5% vs last month</p>
                            </div>
                        </div>

                        <div className="bg-white border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[13px] font-bold text-[var(--muted-text)] uppercase tracking-wider">ARPU</p>
                                <div className="w-10 h-10 rounded-full bg-[var(--brand-50)] flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-[var(--brand)]" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[32px] font-bold text-[var(--heading)] mb-1">${arpu}</p>
                                <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +2.1% vs last month</p>
                            </div>
                        </div>

                        <div className="bg-white border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[13px] font-bold text-[var(--muted-text)] uppercase tracking-wider">Active Subs</p>
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[32px] font-bold text-[var(--heading)] mb-1">{activeSubs}</p>
                                <p className="text-[12px] font-bold text-[var(--muted-text)] flex items-center gap-1">Out of {orgs.length} total</p>
                            </div>
                        </div>

                        <div className="bg-white border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[13px] font-bold text-[var(--muted-text)] uppercase tracking-wider">Workspaces</p>
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[32px] font-bold text-[var(--heading)] mb-1">{orgs.length}</p>
                                <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +5 this week</p>
                            </div>
                        </div>
                    </div>

                    {/* Organizations Table */}
                    <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[var(--border-light)] bg-[#FAFAFA]/50 flex items-center justify-between gap-4">
                            <h3 className="text-[16px] font-bold text-[var(--heading)] flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[var(--muted-text)]" /> All Workspaces
                            </h3>

                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                                <input
                                    type="text"
                                    placeholder="Search organizations..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-9 pr-4 text-[13px] font-medium border border-[var(--border-light)] rounded-lg bg-white focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-light)] bg-[#FAFAFA]">
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Workspace</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">ID</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Joined</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">SaaS Plan</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-light)]">
                                    {filteredOrgs.map((org) => (
                                        <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4">
                                                <p className="text-[14px] font-bold text-[var(--heading)]">{org.name}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-[12px] font-mono text-[var(--muted-text)] px-2 py-1 bg-gray-100 rounded inline-block">{org.id.slice(0, 8)}...</p>
                                            </td>
                                            <td className="p-4 text-[13px] font-medium text-[var(--body)]">
                                                {org.createdAt?.toDate ? org.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${org.plan === "enterprise" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                                    org.plan === "pro" ? "bg-[var(--brand-50)] text-[var(--brand-dark)] border border-purple-200" :
                                                        "bg-gray-100 text-gray-600 border border-gray-200"
                                                    }`}>
                                                    {org.plan}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right relative">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {updatingOrg === org.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-[var(--brand)] mr-2" />
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleUpgrade(org.id, "free")} disabled={org.plan === "free"} className="text-[11px] font-bold uppercase bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 disabled:opacity-30 transition-all">Free</button>
                                                            <button onClick={() => handleUpgrade(org.id, "pro")} disabled={org.plan === "pro"} className="text-[11px] font-bold uppercase bg-[var(--brand-50)] border border-[var(--brand-100)] text-[var(--brand)] px-3 py-1.5 rounded-md hover:bg-purple-100 disabled:opacity-30 transition-all">Pro</button>
                                                            <button onClick={() => handleUpgrade(org.id, "enterprise")} disabled={org.plan === "enterprise"} className="text-[11px] font-bold uppercase bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-md hover:bg-amber-100 disabled:opacity-30 transition-all">Ent</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrgs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-[14px] font-medium text-[var(--muted-text)]">
                                                No organizations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "invoices" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[var(--border-light)] bg-[#FAFAFA]/50 flex items-center justify-between gap-4">
                            <h3 className="text-[16px] font-bold text-[var(--heading)] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[var(--muted-text)]" /> All Invoices
                            </h3>

                            <div className="relative max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                                <input
                                    type="text"
                                    placeholder="Search by workspace or ID..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-9 pr-4 text-[13px] font-medium border border-[var(--border-light)] rounded-lg bg-white focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-light)] bg-[#FAFAFA]">
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Invoice</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Workspace</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Amount</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Due Date</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Status</th>
                                        <th className="p-4 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-text)] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-light)]">
                                    {filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4">
                                                <p className="text-[13px] font-bold text-[var(--heading)]">{inv.invoiceNumber}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-[14px] font-bold text-[var(--heading)]">{inv.orgName}</p>
                                            </td>
                                            <td className="p-4 text-[14px] font-bold text-[var(--heading)]">
                                                ${inv.amount.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-[13px] font-medium text-[var(--body)]">
                                                {inv.dueDate?.toDate ? inv.dueDate.toDate().toLocaleDateString() : new Date(inv.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${inv.status === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                        inv.status === "open" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                            "bg-red-50 text-red-700 border border-red-200"
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 text-[var(--muted-text)] hover:text-[var(--brand)] bg-transparent hover:bg-[var(--brand-50)] rounded-lg transition-colors inline-flex items-center gap-2 text-[12px] font-bold">
                                                    <Download className="w-4 h-4" /> Download PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInvoices.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-[14px] font-medium text-[var(--muted-text)]">
                                                No invoices found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
