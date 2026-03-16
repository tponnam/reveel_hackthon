"use client";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    status: string;
    createdAt: any;
}

// Fallback sample posts for when Firestore has no data
const samplePosts: BlogPost[] = [
    { id: "1", slug: "#", title: "How AI Agents Are Changing Product Demos Forever", excerpt: "Traditional screen recording is dead. Here's why AI-orchestrated demos are the future of product storytelling.", category: "Product", status: "published", createdAt: { seconds: 1741276800 } },
    { id: "2", slug: "#", title: "5 Tips for Creating Demos That Close Deals", excerpt: "Learn the science behind demo videos that convert prospects into paying customers, backed by data from 1,000+ demos.", category: "Sales", status: "published", createdAt: { seconds: 1740672000 } },
    { id: "3", slug: "#", title: "Introducing Multi-Language Demo Generation", excerpt: "Reveel AI now supports 4 languages out of the box. Reach global audiences without re-recording.", category: "Feature", status: "published", createdAt: { seconds: 1740067200 } },
    { id: "4", slug: "#", title: "The Technical Architecture Behind Reveel AI", excerpt: "A deep dive into how we use Playwright, Gemini, and FFmpeg to generate studio-quality videos from a single URL.", category: "Engineering", status: "published", createdAt: { seconds: 1739635200 } },
    { id: "5", slug: "#", title: "Why Every SaaS Needs an Automated Demo Strategy", excerpt: "Manual demos don't scale. Here's how top SaaS companies are automating their demo workflows.", category: "Strategy", status: "published", createdAt: { seconds: 1739203200 } },
    { id: "6", slug: "#", title: "From URL to Video in 60 Seconds: Our Vision", excerpt: "The founding story of Reveel AI and the problem we set out to solve for product teams everywhere.", category: "Company", status: "published", createdAt: { seconds: 1738339200 } },
];

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const snap = await getDocs(collection(db, "blog_posts"));
                const published = snap.docs
                    .map(d => ({ ...(d.data() as BlogPost), id: d.id }))
                    .filter(p => p.status === "published");

                setPosts(published.length > 0 ? published : samplePosts);
            } catch {
                setPosts(samplePosts);
            }
            setLoading(false);
        }
        fetchPosts();
    }, []);

    function formatDate(ts: any): string {
        if (!ts?.seconds) return "";
        return new Date(ts.seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    return (
        <main>
            <Header />
            <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">
                <span className="text-[12px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-3 py-1.5 rounded-full border border-[var(--brand-100)] tracking-wide uppercase">Blog</span>
                <h1 className="text-[40px] font-bold text-[var(--heading)] mt-6 mb-4">Insights & Updates</h1>
                <p className="text-[17px] text-[var(--body)] font-medium mb-12 max-w-xl">The latest on AI video generation, product demos, and sales enablement.</p>

                {loading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="bg-[var(--surface-dim)] rounded-2xl h-48 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {posts.map((post) => (
                            <Link href={post.slug === "#" ? "#" : `/blog/${post.slug}`} key={post.id} className="group bg-white border border-[var(--border-light)] rounded-2xl p-6 hover:shadow-lg hover:border-[var(--brand-100)] transition-all">
                                <span className="text-[11px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-2 py-0.5 rounded-md">{post.category}</span>
                                <h2 className="text-[18px] font-bold text-[var(--heading)] mt-3 mb-2 group-hover:text-[var(--brand)] transition-colors">{post.title}</h2>
                                <p className="text-[14px] text-[var(--body)] font-medium leading-relaxed mb-4">{post.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--muted-text)]"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}</span>
                                    <span className="text-[13px] font-bold text-[var(--brand)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Read <ArrowRight className="w-3.5 h-3.5" /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
