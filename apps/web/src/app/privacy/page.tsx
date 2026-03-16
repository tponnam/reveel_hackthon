import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
    title: "Privacy Policy — Reveel AI",
    description: "Learn how Reveel AI collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return (
        <main>
            <Header />
            <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
                <h1 className="text-[36px] font-bold text-[var(--heading)] mb-2">Privacy Policy</h1>
                <p className="text-[14px] font-medium text-[var(--muted-text)] mb-10">Last updated: March 1, 2026</p>

                <div className="prose-reveel space-y-8">
                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">1. Information We Collect</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">When you create an account, we collect your name, email address, and authentication credentials. When you use our demo generation service, we collect the URLs you submit and the configuration options you select. We also collect usage analytics to improve our service.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">2. How We Use Your Information</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">We use your information to provide and improve our demo generation service, communicate with you about your account, send service updates, and analyze usage patterns to enhance the platform.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">3. Data Storage & Security</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">Your data is stored securely on Google Cloud Platform using Firebase services. We employ industry-standard encryption (TLS 1.3) for data in transit and AES-256 for data at rest. Generated demo videos are stored in Firebase Cloud Storage with access controls.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">4. Third-Party Services</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">We use Google Cloud services (Firebase, Gemini AI, Cloud TTS) for core functionality, and Stripe for payment processing. Each provider has their own privacy practices, which we encourage you to review.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">5. Your Rights</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@reveel.ai. You may also export your data or close your account through the Settings page.</p>
                    </section>

                    <section id="dpa">
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">6. Data Processing Agreement (DPA)</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">For enterprise customers requiring a Data Processing Agreement, please contact us at legal@reveel.ai. We offer standard DPA terms compliant with GDPR and CCPA requirements.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">7. Contact</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">For privacy-related inquiries, contact our Data Protection Officer at privacy@reveel.ai.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
