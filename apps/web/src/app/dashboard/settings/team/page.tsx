"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { UserPlus, Copy, Trash2, CheckCircle2, Shield, User, Loader2, Users } from "lucide-react";

interface TeamMember {
    uid: string;
    email: string;
    name: string;
    role: "owner" | "admin" | "member";
    orgRole: "owner" | "admin" | "member";
}

interface Invite {
    id: string;
    email: string;
    role: "admin" | "member";
    status: "pending" | "accepted";
    createdAt: any;
}

export default function TeamSettingsPage() {
    const { user, orgId, orgRole, role: globalRole } = useAuth();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
    const [creatingInvite, setCreatingInvite] = useState(false);
    const [createdInviteLink, setCreatedInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user && orgId === undefined) return; // Still loading auth context
        if (!orgId) {
            setLoading(false);
            return;
        }
        fetchTeam();
    }, [orgId, user]);

    async function fetchTeam() {
        if (!orgId) return;
        setLoading(true);
        try {
            // Fetch Members
            const mSnap = await getDocs(query(collection(db, "users"), where("orgId", "==", orgId)));
            setMembers(mSnap.docs.map(d => d.data() as TeamMember));

            // Fetch Invites
            const iSnap = await getDocs(query(collection(db, "invites"), where("orgId", "==", orgId), where("status", "==", "pending")));
            setInvites(iSnap.docs.map(d => ({ ...(d.data() as Invite), id: d.id })));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteEmail || !orgId || !user) return;

        setCreatingInvite(true);
        try {
            const inviteRef = doc(collection(db, "invites"));
            await setDoc(inviteRef, {
                orgId,
                email: inviteEmail,
                role: inviteRole,
                invitedBy: user.uid,
                status: "pending",
                createdAt: serverTimestamp()
            });

            // Generate the link
            const url = new URL(window.location.origin + "/auth/signup");
            url.searchParams.set("invite", inviteRef.id);
            url.searchParams.set("email", inviteEmail);

            setCreatedInviteLink(url.toString());
            setInviteEmail("");
            fetchTeam();
        } catch (err) {
            console.error(err);
        }
        setCreatingInvite(false);
    }

    async function revokeInvite(id: string) {
        if (!confirm("Remove this pending invite?")) return;
        await deleteDoc(doc(db, "invites", id));
        fetchTeam();
    }

    async function removeMember(uid: string) {
        if (!confirm("Remove this member from the organization?")) return;
        // In a real app, this should be a secure backend function so they can't remove themselves
        // For now, we update their doc to remove orgId if executing user is owner/admin
        try {
            await setDoc(doc(db, "users", uid), { orgId: null, orgRole: null }, { merge: true });
            fetchTeam();
        } catch (err) {
            alert("No permission to remove members. Ensure you are an org admin/owner.");
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(createdInviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const canManageTeam = orgRole === "owner" || orgRole === "admin" || globalRole === "admin";

    if (loading) {
        return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--brand)]" /></div>;
    }

    if (!orgId) {
        return (
            <div className="bg-white border border-[var(--border-light)] rounded-[24px] p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-[var(--border-light)]">
                    <Users className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <h3 className="text-[18px] font-bold text-[var(--heading)]">No Workspace Found</h3>
                    <p className="text-[14px] font-medium text-[var(--body)] max-w-sm mx-auto mt-2">
                        You are not currently part of any team workspace. Contact your administrator for an invitation link to join their team.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Active Members */}
            <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)] bg-[#FAFAFA]/50">
                    <h3 className="text-[16px] font-bold text-[var(--heading)]">Team Members</h3>
                    <p className="text-[14px] text-[var(--body)] font-medium mt-1">People currently part of your workspace.</p>
                </div>
                <div className="divide-y divide-[var(--border-light)]">
                    {members.map(m => (
                        <div key={m.uid} className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--surface-dim)] border border-[var(--border-light)] flex items-center justify-center">
                                    <User className="w-5 h-5 text-[var(--muted-text)]" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-[var(--heading)] flex items-center gap-2">
                                        {m.name}
                                        {m.uid === user?.uid && <span className="bg-[#FAFAFA] border border-[var(--border-light)] text-[10px] font-bold text-[#888] px-1.5 py-0.5 rounded uppercase">You</span>}
                                    </p>
                                    <p className="text-[13px] text-[var(--muted-text)] font-medium mt-0.5">{m.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--body)] bg-[var(--surface-dim)] px-2.5 py-1 rounded-md border border-[var(--border-light)] capitalize">
                                    {(m.orgRole || "owner") === "owner" ? <Shield className="w-3.5 h-3.5 text-amber-500" /> : null}
                                    {m.orgRole || "owner"}
                                </span>
                                {canManageTeam && m.uid !== user?.uid && m.orgRole !== "owner" && (
                                    <button onClick={() => removeMember(m.uid)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove Member">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invite New Member */}
            {canManageTeam && (
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[var(--surface-alt)] md:border-r border-b md:border-b-0 border-[var(--border-light)] p-8">
                        <h3 className="text-[15px] font-bold text-[var(--heading)] flex items-center gap-2 mb-3">
                            <UserPlus className="w-5 h-5 text-[var(--muted-text)]" />
                            Invite People
                        </h3>
                        <p className="text-[14px] text-[var(--body)] font-medium leading-relaxed">Send an invitation to join your workspace.</p>
                    </div>
                    <div className="md:w-2/3 p-8">
                        <form onSubmit={handleInvite} className="flex gap-3">
                            <input
                                type="email" required placeholder="colleague@company.com"
                                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                className="flex-1 h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                            />
                            <select
                                value={inviteRole} onChange={e => setInviteRole(e.target.value as "admin" | "member")}
                                className="w-32 h-11 px-3 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button disabled={creatingInvite} type="submit" className="bg-[var(--heading)] hover:bg-black text-white h-11 px-6 rounded-xl text-[14px] font-bold transition-colors disabled:opacity-50 blur-0">
                                {creatingInvite ? "Wait..." : "Create"}
                            </button>
                        </form>

                        {createdInviteLink && (
                            <div className="mt-6 p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl space-y-3">
                                <p className="text-[13px] font-bold text-emerald-800">✅ Invite created! Share this link with them:</p>
                                <div className="flex items-center gap-2 bg-white border border-emerald-200 p-2 rounded-lg">
                                    <input readOnly value={createdInviteLink} className="flex-1 bg-transparent text-[12px] font-mono text-[var(--body)] outline-none" />
                                    <button onClick={copyLink} className="p-1.5 hover:bg-emerald-50 rounded-md text-emerald-600 font-bold text-[12px] flex items-center gap-1 transition-colors">
                                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pending Invites */}
            {canManageTeam && invites.length > 0 && (
                <div className="bg-white border border-[var(--border-light)] rounded-[24px] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-light)] bg-[#FAFAFA]/50">
                        <h3 className="text-[16px] font-bold text-[var(--heading)] gap-2 flex items-center">
                            Pending Invites <span className="bg-[var(--surface-dim)] border border-[var(--border-light)] text-[11px] px-2 py-0.5 rounded-full">{invites.length}</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-[var(--border-light)]">
                        {invites.map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-6">
                                <div>
                                    <p className="text-[14px] font-bold text-[var(--heading)]">{inv.email}</p>
                                    <p className="text-[13px] text-[var(--muted-text)] font-medium mt-0.5">Invited to join as {inv.role}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => {
                                        const url = new URL(window.location.origin + "/auth/signup");
                                        url.searchParams.set("invite", inv.id);
                                        url.searchParams.set("email", inv.email);
                                        navigator.clipboard.writeText(url.toString());
                                        alert("Invite link copied to clipboard!");
                                    }} className="text-[13px] font-bold text-[var(--brand)] hover:underline">
                                        Copy Link
                                    </button>
                                    <button onClick={() => revokeInvite(inv.id)} className="text-[13px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
