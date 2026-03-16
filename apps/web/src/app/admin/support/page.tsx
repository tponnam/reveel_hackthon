"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Ticket, CheckCircle2, MessageSquare, Clock, Search, Trash2, Mail } from "lucide-react";

interface SupportTicket {
    id: string;
    userId: string;
    email: string;
    subject: string;
    message: string;
    status: "open" | "resolved";
    createdAt: any;
}

export default function AdminSupportPage() {
    const { role } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    useEffect(() => {
        if (role !== "admin") return;

        const q = query(
            collection(db, "support_tickets"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as SupportTicket));
            setTickets(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tickets:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [role]);

    const handleResolve = async (id: string, currentStatus: string) => {
        try {
            await updateDoc(doc(db, "support_tickets", id), {
                status: currentStatus === "open" ? "resolved" : "open"
            });
            if (selectedTicket?.id === id) {
                setSelectedTicket({ ...selectedTicket, status: currentStatus === "open" ? "resolved" : "open" });
            }
        } catch (err) {
            console.error("Failed to update ticket", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this ticket?")) return;
        try {
            await deleteDoc(doc(db, "support_tickets", id));
            if (selectedTicket?.id === id) setSelectedTicket(null);
        } catch (err) {
            console.error("Failed to delete ticket", err);
        }
    };

    if (role !== "admin") return null;

    if (loading) {
        return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" /></div>;
    }

    const filteredTickets = tickets.filter(t =>
        t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCount = tickets.filter(t => t.status === "open").length;

    return (
        <div className="space-y-8 pb-12 h-[calc(100vh-100px)] flex flex-col">
            <div className="border-b border-[var(--border-light)] pb-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold text-[var(--heading)] mb-2">Customer Support</h1>
                        <p className="text-[16px] font-medium text-[var(--body)]">Manage incoming inquiries and support tickets.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm font-bold text-[14px]">
                            <Clock className="w-4 h-4" /> {openCount} Open Tickets
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-[500px]">
                {/* Tickets List */}
                <div className="w-1/3 bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-[var(--border-light)] bg-[#FAFAFA]/50 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                            <input
                                type="text"
                                placeholder="Search queries..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 text-[13px] font-medium border border-[var(--border-light)] rounded-lg bg-white focus:ring-2 focus:ring-[var(--brand)] outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-light)] custom-scrollbar pb-6">
                        {filteredTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`w-full text-left p-5 transition-colors hover:bg-gray-50 focus:outline-none ${selectedTicket?.id === ticket.id ? 'bg-[var(--brand-50)] border-l-4 border-l-[var(--brand)]' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[14px] font-bold text-[var(--heading)] line-clamp-1 pr-4">{ticket.subject || "No Subject"}</h4>
                                    <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-[13px] text-[var(--body)] font-medium line-clamp-2 leading-relaxed mb-3">
                                    {ticket.message || "No message content."}
                                </p>
                                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted-text)]">
                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {ticket.email}</span>
                                    <span>{ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                                </div>
                            </button>
                        ))}
                        {filteredTickets.length === 0 && (
                            <div className="p-8 text-center text-[14px] font-medium text-[var(--muted-text)] mt-10">
                                <Ticket className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                No tickets found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="flex-1 bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm flex flex-col overflow-hidden relative">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b border-[var(--border-light)] bg-[#FAFAFA]/50 shrink-0 flex justify-between items-staert">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-[20px] font-bold text-[var(--heading)] leading-tight">{selectedTicket.subject || "No Subject"}</h3>
                                        <span className={`shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${selectedTicket.status === 'open' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            {selectedTicket.status === 'open' ? 'Open' : 'Resolved'}
                                        </span>
                                    </div>
                                    <p className="text-[14px] font-medium text-[var(--body)] flex items-center gap-2">
                                        From: <a href={`mailto:${selectedTicket.email}`} className="text-[var(--brand)] font-bold hover:underline">{selectedTicket.email}</a> • {selectedTicket.createdAt?.toDate ? selectedTicket.createdAt.toDate().toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleResolve(selectedTicket.id, selectedTicket.status)}
                                        className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm flex items-center gap-2 ${selectedTicket.status === 'open' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {selectedTicket.status === 'open' ? 'Mark Resolved' : 'Re-open Ticket'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedTicket.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                        title="Delete Ticket"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="bg-[#FAFAFA] border border-[var(--border-light)] rounded-2xl p-6">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-[var(--surface-dim)] border border-[var(--border-light)] flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-[14px] font-bold text-[var(--heading)]">{selectedTicket.email.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-[var(--heading)]">{selectedTicket.email}</p>
                                            <p className="text-[12px] font-medium text-[var(--muted-text)] mt-0.5">User Inquiry</p>
                                        </div>
                                    </div>
                                    <div className="text-[15px] font-medium text-[var(--heading)] leading-relaxed whitespace-pre-wrap">
                                        {selectedTicket.message || "No message content."}
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-[var(--border-light)]">
                                    <h4 className="text-[14px] font-bold text-[var(--heading)] mb-4">Reply via Email</h4>
                                    <p className="text-[14px] text-[var(--body)] font-medium mb-4">
                                        Support replies are handled via your native email client. Clicking below will open a draft with the customer's context pre-filled.
                                    </p>
                                    <a
                                        href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                                        className="inline-flex items-center justify-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white h-11 px-6 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_0_rgba(96,46,223,0.39)] transition-all hover:-translate-y-0.5"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Compose Direct Reply
                                    </a>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--muted-text)]">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-[16px] font-bold">Select a ticket</p>
                            <p className="text-[14px] font-medium text-[var(--body)] mt-2">Choose an inquiry from the list to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
