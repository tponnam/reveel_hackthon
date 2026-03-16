"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Plus, Save, Trash2, ArrowLeft, Eye, Edit3, Bold, Italic, Heading, List, Link2, Image, Code, Quote, Type } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    status: "draft" | "published";
    createdAt: any;
    updatedAt: any;
}

const categories = ["Product", "Engineering", "Sales", "Strategy", "Company", "Feature"];

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [preview, setPreview] = useState(false);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        try {
            const snap = await getDocs(collection(db, "blog_posts"));
            const data = snap.docs.map(d => ({ ...(d.data() as BlogPost), id: d.id }));
            data.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            setPosts(data);
        } catch { }
        setLoading(false);
    }

    function newPost() {
        setEditing({
            id: `post_${Date.now()}`,
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            category: "Product",
            status: "draft",
            createdAt: null,
            updatedAt: null,
        });
    }

    async function savePost() {
        if (!editing) return;
        const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const data = {
            ...editing,
            slug,
            updatedAt: serverTimestamp(),
            ...(!editing.createdAt && { createdAt: serverTimestamp() }),
        };
        await setDoc(doc(db, "blog_posts", editing.id), data);
        setEditing(null);
        fetchPosts();
    }

    async function deletePost(id: string) {
        if (!confirm("Delete this post?")) return;
        await deleteDoc(doc(db, "blog_posts", id));
        fetchPosts();
    }

    function insertMarkdown(before: string, after: string = "") {
        const ta = editorRef.current;
        if (!ta || !editing) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = editing.content.substring(start, end);
        const replacement = `${before}${selected || "text"}${after}`;
        const newContent = editing.content.substring(0, start) + replacement + editing.content.substring(end);
        setEditing({ ...editing, content: newContent });
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + (selected || "text").length); }, 0);
    }

    // Simple markdown to HTML preview
    function renderMarkdown(md: string): string {
        return md
            .replace(/^### (.+)$/gm, '<h3 class="text-[18px] font-bold text-[var(--heading)] mt-6 mb-2">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-[22px] font-bold text-[var(--heading)] mt-8 mb-3">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-[28px] font-bold text-[var(--heading)] mt-8 mb-4">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="text-[13px] bg-[#F0F0F0] px-1.5 py-0.5 rounded">$1</code>')
            .replace(/^- (.+)$/gm, '<li class="ml-4 text-[15px] text-[var(--body)]">• $1</li>')
            .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[var(--brand)] pl-4 text-[var(--body)] italic my-4">$1</blockquote>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');
    }

    // Editor view
    if (editing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-[14px] font-bold text-[var(--body)] hover:text-[var(--heading)] transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Posts
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setPreview(!preview)} className={`flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-bold border transition-colors ${preview ? "bg-[var(--brand-50)] text-[var(--brand)] border-[var(--brand-100)]" : "border-[var(--border-light)] text-[var(--body)]"}`}>
                            {preview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {preview ? "Edit" : "Preview"}
                        </button>
                        <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as "draft" | "published" })}
                            className="h-9 px-3 text-[13px] font-bold border border-[var(--border-light)] rounded-lg bg-white outline-none">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                        <button onClick={savePost} className="flex items-center gap-2 h-9 px-5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white rounded-lg text-[13px] font-bold transition-colors">
                            <Save className="w-3.5 h-3.5" /> Save
                        </button>
                    </div>
                </div>

                {/* Meta fields */}
                <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 space-y-4">
                    <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Post title..."
                        className="w-full text-[28px] font-black text-[var(--heading)] outline-none placeholder:text-[#CCC] border-0 bg-transparent" />
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[12px] font-bold text-[var(--muted-text)] block mb-1">Slug</label>
                            <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="auto-generated"
                                className="w-full h-9 px-3 text-[13px] font-medium border border-[var(--border-light)] rounded-lg bg-[var(--surface-dim)] outline-none" />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[var(--muted-text)] block mb-1">Category</label>
                            <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                                className="w-full h-9 px-3 text-[13px] font-medium border border-[var(--border-light)] rounded-lg bg-[var(--surface-dim)] outline-none">
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-[var(--muted-text)] block mb-1">Excerpt</label>
                            <input value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Brief summary..."
                                className="w-full h-9 px-3 text-[13px] font-medium border border-[var(--border-light)] rounded-lg bg-[var(--surface-dim)] outline-none" />
                        </div>
                    </div>
                </div>

                {/* Notion-like Editor */}
                <div className="bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-light)] bg-[var(--surface-dim)]">
                        {[
                            { icon: Heading, fn: () => insertMarkdown("## ", ""), tip: "Heading" },
                            { icon: Bold, fn: () => insertMarkdown("**", "**"), tip: "Bold" },
                            { icon: Italic, fn: () => insertMarkdown("*", "*"), tip: "Italic" },
                            { icon: Code, fn: () => insertMarkdown("`", "`"), tip: "Code" },
                            { icon: List, fn: () => insertMarkdown("- ", ""), tip: "List" },
                            { icon: Quote, fn: () => insertMarkdown("> ", ""), tip: "Quote" },
                            { icon: Link2, fn: () => insertMarkdown("[", "](url)"), tip: "Link" },
                            { icon: Image, fn: () => insertMarkdown("![alt](", ")"), tip: "Image" },
                        ].map((tool, i) => (
                            <button key={i} onClick={tool.fn} title={tool.tip}
                                className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors">
                                <tool.icon className="w-4 h-4 text-[var(--body)]" />
                            </button>
                        ))}
                    </div>

                    {preview ? (
                        <div className="p-8 min-h-[400px] prose-reveel text-[15px] text-[var(--body)] font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(editing.content) }} />
                    ) : (
                        <textarea
                            ref={editorRef}
                            value={editing.content}
                            onChange={e => setEditing({ ...editing, content: e.target.value })}
                            placeholder="Start writing your post in Markdown...&#10;&#10;# Use headings&#10;**Bold** and *italic* text&#10;- Bullet lists&#10;> Blockquotes&#10;`inline code`"
                            className="w-full min-h-[400px] p-8 text-[15px] font-medium text-[var(--heading)] leading-relaxed outline-none resize-none font-mono bg-transparent placeholder:text-[#CCC]"
                        />
                    )}
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Blog Manager</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">{posts.length} posts · Content managed via Firestore</p>
                </div>
                <button onClick={newPost} className="flex items-center gap-2 h-10 px-5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white rounded-xl text-[14px] font-bold transition-colors">
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </div>

            <div className="bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-[var(--muted-text)]">Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className="p-10 text-center">
                        <Type className="w-8 h-8 text-[var(--muted-text)] mx-auto mb-3" />
                        <p className="text-[14px] font-bold text-[var(--body)] mb-1">No blog posts yet</p>
                        <p className="text-[13px] text-[var(--muted-text)]">Create your first post to get started.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-light)] bg-[var(--surface-dim)]">
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Title</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Category</th>
                                <th className="text-left text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-right text-[12px] font-bold text-[var(--heading)] uppercase tracking-wider px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-[14px] font-bold text-[var(--heading)]">{post.title || "Untitled"}</p>
                                        <p className="text-[12px] text-[var(--muted-text)] mt-0.5 truncate max-w-[300px]">{post.excerpt}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-bold text-[var(--brand)] bg-[var(--brand-50)] px-2 py-0.5 rounded-md">{post.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${post.status === "published" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-[var(--muted-text)] bg-[var(--surface-dim)] border-[var(--border-light)]"}`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => setEditing(post)} className="text-[12px] font-bold text-[var(--brand)] hover:underline">Edit</button>
                                        <button onClick={() => deletePost(post.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
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
