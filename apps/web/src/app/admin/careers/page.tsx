"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Plus, Save, Trash2, ArrowLeft, MapPin, Briefcase, Users, Eye, EyeOff } from "lucide-react";

interface CareerPost {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string;
    status: "active" | "closed";
    createdAt: any;
}

const departments = ["Engineering", "Design", "Marketing", "Sales", "Product", "Operations"];
const locations = ["Remote", "San Francisco, CA", "New York, NY", "US / Europe", "Anywhere"];
const types = ["Full-time", "Part-time", "Contract", "Internship"];

export default function AdminCareersPage() {
    const [jobs, setJobs] = useState<CareerPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<CareerPost | null>(null);

    useEffect(() => { fetchJobs(); }, []);

    async function fetchJobs() {
        try {
            const snap = await getDocs(collection(db, "careers"));
            const data = snap.docs.map(d => ({ ...(d.data() as CareerPost), id: d.id }));
            setJobs(data);
        } catch { }
        setLoading(false);
    }

    function newJob() {
        setEditing({
            id: `career_${Date.now()}`,
            title: "",
            department: "Engineering",
            location: "Remote",
            type: "Full-time",
            description: "",
            requirements: "",
            status: "active",
            createdAt: null,
        });
    }

    async function saveJob() {
        if (!editing) return;
        await setDoc(doc(db, "careers", editing.id), {
            ...editing,
            ...(!editing.createdAt && { createdAt: serverTimestamp() }),
        });
        setEditing(null);
        fetchJobs();
    }

    async function deleteJob(id: string) {
        if (!confirm("Delete this position?")) return;
        await deleteDoc(doc(db, "careers", id));
        fetchJobs();
    }

    async function toggleStatus(job: CareerPost) {
        const newStatus = job.status === "active" ? "closed" : "active";
        await setDoc(doc(db, "careers", job.id), { ...job, status: newStatus });
        fetchJobs();
    }

    // Editor view
    if (editing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-[14px] font-bold text-[var(--body)] hover:text-[var(--heading)] transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Careers
                    </button>
                    <button onClick={saveJob} className="flex items-center gap-2 h-10 px-5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white rounded-xl text-[14px] font-bold transition-colors">
                        <Save className="w-4 h-4" /> Save Position
                    </button>
                </div>

                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 space-y-5">
                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Job Title</label>
                        <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Senior Full-Stack Engineer"
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none" />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Department</label>
                            <select value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })}
                                className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none">
                                {departments.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Location</label>
                            <select value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })}
                                className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none">
                                {locations.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Employment Type</label>
                            <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}
                                className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none">
                                {types.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Job Description (Markdown)</label>
                        <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}
                            placeholder="Describe the role, responsibilities, and what a typical day looks like..." rows={6}
                            className="w-full px-4 py-3 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none resize-none font-mono" />
                    </div>

                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Requirements (Markdown)</label>
                        <textarea value={editing.requirements} onChange={e => setEditing({ ...editing, requirements: e.target.value })}
                            placeholder="- 5+ years of experience&#10;- Strong TypeScript skills&#10;- Experience with cloud platforms" rows={5}
                            className="w-full px-4 py-3 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none resize-none font-mono" />
                    </div>

                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Status</label>
                        <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as "active" | "closed" })}
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none">
                            <option value="active">Active — Accepting Applications</option>
                            <option value="closed">Closed — No Longer Accepting</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Career Manager</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">{jobs.length} positions · Managed via Firestore</p>
                </div>
                <button onClick={newJob} className="flex items-center gap-2 h-10 px-5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white rounded-xl text-[14px] font-bold transition-colors">
                    <Plus className="w-4 h-4" /> New Position
                </button>
            </div>

            <div className="bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-[var(--muted-text)]">Loading positions...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-10 text-center">
                        <Users className="w-8 h-8 text-[var(--muted-text)] mx-auto mb-3" />
                        <p className="text-[14px] font-bold text-[var(--body)] mb-1">No open positions</p>
                        <p className="text-[13px] text-[var(--muted-text)]">Create your first job posting.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-light)] bg-[var(--surface-dim)]">
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Position</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Department</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-right text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-[var(--heading)]">{job.title || "Untitled"}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[12px] font-medium text-[var(--muted-text)] flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                            <span className="text-[12px] font-medium text-[var(--muted-text)] flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-2 py-0.5 rounded-md">{job.department}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleStatus(job)}
                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${job.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-[var(--muted-text)] bg-[var(--surface-dim)] border-[var(--border-light)]"}`}>
                                            {job.status === "active" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {job.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => setEditing(job)} className="text-[12px] font-bold text-[var(--brand)] hover:underline">Edit</button>
                                        <button onClick={() => deleteJob(job.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
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
