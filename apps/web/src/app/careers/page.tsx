"use client";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface CareerPost {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    status: string;
}

// Fallback sample jobs
const sampleJobs: CareerPost[] = [
    { id: "1", title: "Senior Full-Stack Engineer", location: "Remote", type: "Full-time", department: "Engineering", description: "", status: "active" },
    { id: "2", title: "ML/AI Engineer", location: "Remote", type: "Full-time", department: "Engineering", description: "", status: "active" },
    { id: "3", title: "Product Designer", location: "Remote", type: "Full-time", department: "Design", description: "", status: "active" },
    { id: "4", title: "Developer Advocate", location: "Remote", type: "Full-time", department: "Marketing", description: "", status: "active" },
    { id: "5", title: "Account Executive", location: "US / Europe", type: "Full-time", department: "Sales", description: "", status: "active" },
];

export default function CareersPage() {
    const [jobs, setJobs] = useState<CareerPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const snap = await getDocs(collection(db, "careers"));
                const active = snap.docs
                    .map(d => ({ ...(d.data() as CareerPost), id: d.id }))
                    .filter(j => j.status === "active");
                setJobs(active.length > 0 ? active : sampleJobs);
            } catch {
                setJobs(sampleJobs);
            }
            setLoading(false);
        }
        fetchJobs();
    }, []);

    return (
        <main>
            <Header />
            <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <span className="text-[12px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-3 py-1.5 rounded-full border border-[var(--brand-100)] tracking-wide uppercase">Careers</span>
                <h1 className="text-[40px] font-bold text-[var(--heading)] mt-6 mb-4">Build the future with us</h1>
                <p className="text-[17px] text-[var(--body)] font-medium mb-12 max-w-xl">We're a small, fast-moving team on a mission to make product demos effortless. Come build something remarkable.</p>

                <h2 className="text-[20px] font-bold text-[var(--heading)] mb-6">Open Positions</h2>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="bg-[var(--surface-dim)] rounded-2xl h-20 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <a href="#" key={job.id} className="group flex items-center justify-between bg-white border border-[var(--border-light)] rounded-2xl px-6 py-5 hover:shadow-lg hover:border-[var(--brand-100)] transition-all">
                                <div>
                                    <h3 className="text-[16px] font-bold text-[var(--heading)] group-hover:text-[var(--brand)] transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="flex items-center gap-1 text-[13px] font-medium text-[var(--body)]"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                                        <span className="flex items-center gap-1 text-[13px] font-medium text-[var(--body)]"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
                                        <span className="text-[11px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-2 py-0.5 rounded-md">{job.department}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[var(--muted-text)] group-hover:text-[var(--brand)] transition-colors" />
                            </a>
                        ))}
                    </div>
                )}

                <div className="mt-12 bg-[var(--surface-dim)] border border-[var(--border-light)] rounded-2xl p-8 text-center">
                    <h3 className="text-[18px] font-bold text-[var(--heading)] mb-2">Don&apos;t see your role?</h3>
                    <p className="text-[14px] text-[var(--body)] font-medium mb-4">We&apos;re always looking for exceptional talent. Send us your resume.</p>
                    <a href="mailto:careers@reveel.ai" className="inline-flex items-center gap-2 bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[var(--brand-dark)] transition-colors">Apply Anyway</a>
                </div>
            </div>
            <Footer />
        </main>
    );
}
