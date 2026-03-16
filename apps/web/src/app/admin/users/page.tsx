"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Shield, User, MoreHorizontal, Search, Mail } from "lucide-react";

interface UserData {
    uid: string;
    email: string;
    name: string;
    role: string;
    status: string;
    plan: string;
    createdAt: any;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchUsers() {
            try {
                const snap = await getDocs(collection(db, "users"));
                const data = snap.docs.map(d => ({ ...(d.data() as UserData), uid: d.id }));
                setUsers(data);
            } catch { }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const toggleRole = async (uid: string, currentRole: string) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        await updateDoc(doc(db, "users", uid), { role: newRole });
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    };

    const toggleStatus = async (uid: string, currentStatus: string) => {
        const newStatus = currentStatus === "approved" ? "pending" : "approved";
        await updateDoc(doc(db, "users", uid), { status: newStatus });
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">User Management</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">{users.length} registered users</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 h-10 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-[var(--muted-text)]">Loading users...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-light)] bg-[var(--surface-dim)]">
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">User</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Role</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Plan</th>
                                <th className="text-right text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.uid} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#EAEAEA] flex items-center justify-center">
                                                <User className="w-4 h-4 text-[#888]" />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[var(--heading)]">{u.name || "—"}</p>
                                                <p className="text-[12px] font-medium text-[var(--muted-text)] flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 w-fit ${u.role === "admin"
                                                ? "text-amber-600 bg-amber-50 border-amber-100"
                                                : "text-[var(--body)] bg-[var(--surface-dim)] border-[var(--border-light)]"
                                            }`}>
                                            {u.role === "admin" && <Shield className="w-3 h-3" />}
                                            {u.role || "user"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border w-fit inline-block ${u.status === "approved"
                                                ? "text-green-700 bg-green-50 border-green-200"
                                                : "text-red-700 bg-red-50 border-red-200"
                                            }`}>
                                            {u.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-[var(--heading)] capitalize">{u.plan || "free"}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => toggleStatus(u.uid, u.status || "pending")}
                                                className={`text-[12px] font-bold transition-colors ${u.status === "approved" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}`}
                                            >
                                                {u.status === "approved" ? "Reject" : "Approve"}
                                            </button>
                                            <button
                                                onClick={() => toggleRole(u.uid, u.role || "user")}
                                                className="text-[12px] font-bold text-[var(--brand)] hover:text-[var(--brand-dark)] transition-colors"
                                            >
                                                {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
