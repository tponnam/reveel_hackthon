"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Settings, Save, ToggleLeft, ToggleRight, AlertTriangle, Loader2, Check, Globe, Palette } from "lucide-react";

interface PlatformSettings {
    maxDemosPerUser: number;
    maxDemoLength: number;
    maintenanceMode: boolean;
    allowSignups: boolean;
    enableVoiceover: boolean;
    enableCaptions: boolean;
    defaultResolution: string;
    platformName: string;
    supportEmail: string;
    defaultLanguage: string;
}

const defaultSettings: PlatformSettings = {
    maxDemosPerUser: 50,
    maxDemoLength: 120,
    maintenanceMode: false,
    allowSignups: true,
    enableVoiceover: true,
    enableCaptions: true,
    defaultResolution: "1080p",
    platformName: "Reveel AI",
    supportEmail: "support@reveel.ai",
    defaultLanguage: "English",
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const snap = await getDoc(doc(db, "platform", "settings"));
                if (snap.exists()) {
                    setSettings({ ...defaultSettings, ...(snap.data() as Partial<PlatformSettings>) });
                }
            } catch { }
            setLoading(false);
        }
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "platform", "settings"), settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save settings:", err);
        }
        setSaving(false);
    };

    const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <button onClick={onToggle} className="transition-colors">
            {enabled ? <ToggleRight className="w-8 h-8 text-[var(--brand)]" /> : <ToggleLeft className="w-8 h-8 text-[#CCC]" />}
        </button>
    );

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[var(--brand)] animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--heading)] mb-1">Platform Settings</h2>
                    <p className="text-[15px] font-medium text-[var(--body)]">Configure global platform behavior. Persisted in Firestore.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white h-10 px-5 rounded-xl text-[14px] font-bold transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Branding */}
            <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 space-y-5">
                <h3 className="text-[16px] font-bold text-[var(--heading)] flex items-center gap-2"><Palette className="w-4 h-4 text-[var(--brand)]" /> Platform Branding</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Platform Name</label>
                        <input value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Support Email</label>
                        <input type="email" value={settings.supportEmail} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none" />
                    </div>
                </div>
            </div>

            {/* Limits */}
            <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 space-y-5">
                <h3 className="text-[16px] font-bold text-[var(--heading)] flex items-center gap-2"><Settings className="w-4 h-4 text-[var(--brand)]" /> Usage Limits</h3>
                <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Max Demos Per User</label>
                        <input type="number" value={settings.maxDemosPerUser} onChange={e => setSettings({ ...settings, maxDemosPerUser: Number(e.target.value) })}
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Max Demo Length (sec)</label>
                        <input type="number" value={settings.maxDemoLength} onChange={e => setSettings({ ...settings, maxDemoLength: Number(e.target.value) })}
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Default Resolution</label>
                        <select value={settings.defaultResolution} onChange={e => setSettings({ ...settings, defaultResolution: e.target.value })}
                            className="w-full h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] focus:ring-2 focus:ring-[var(--brand)] outline-none">
                            <option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p (2K)</option><option value="4K">4K</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Localization */}
            <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 space-y-5">
                <h3 className="text-[16px] font-bold text-[var(--heading)] flex items-center gap-2"><Globe className="w-4 h-4 text-[var(--brand)]" /> Localization</h3>
                <div>
                    <label className="text-[13px] font-bold text-[var(--heading)] block mb-1.5">Default Language</label>
                    <select value={settings.defaultLanguage} onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
                        className="w-64 h-11 px-4 text-[14px] font-medium border border-[var(--border-light)] rounded-xl bg-[var(--surface-dim)] outline-none">
                        <option>English</option><option>Spanish</option><option>French</option><option>German</option>
                    </select>
                </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 space-y-4">
                <h3 className="text-[16px] font-bold text-[var(--heading)]">Feature Flags</h3>
                {[
                    { label: "Allow New Signups", desc: "Control whether new users can create accounts", key: "allowSignups" as const },
                    { label: "Enable Voiceover", desc: "Enable TTS voiceover generation for demos", key: "enableVoiceover" as const },
                    { label: "Enable Captions", desc: "Enable auto-generated captions on demos", key: "enableCaptions" as const },
                ].map(flag => (
                    <div key={flag.key} className="flex items-center justify-between py-3 border-b border-[var(--border-light)] last:border-0">
                        <div>
                            <p className="text-[14px] font-bold text-[var(--heading)]">{flag.label}</p>
                            <p className="text-[13px] font-medium text-[var(--body)]">{flag.desc}</p>
                        </div>
                        <Toggle enabled={settings[flag.key]} onToggle={() => setSettings({ ...settings, [flag.key]: !settings[flag.key] })} />
                    </div>
                ))}
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-2xl p-6">
                <h3 className="text-[16px] font-bold text-red-600 flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4" /> Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-bold text-[var(--heading)]">Maintenance Mode</p>
                        <p className="text-[13px] font-medium text-[var(--body)]">Disable the platform for all users while performing maintenance.</p>
                    </div>
                    <Toggle enabled={settings.maintenanceMode} onToggle={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })} />
                </div>
            </div>
        </div>
    );
}
