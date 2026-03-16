import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata = {
    title: "Terms of Service — Reveel AI",
    description: "Terms and conditions for using the Reveel AI platform.",
};

export default function TermsPage() {
    return (
        <main>
            <Header />
            <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
                <h1 className="text-[36px] font-bold text-[var(--heading)] mb-2">Terms of Service</h1>
                <p className="text-[14px] font-medium text-[var(--muted-text)] mb-10">Last updated: March 1, 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">1. Acceptance of Terms</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">By accessing or using Reveel AI ("the Service"), you agree to be bound by these Terms of Service. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">2. Service Description</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">Reveel AI provides an AI-powered demo video generation platform. You provide a URL and configuration options, and our AI agents navigate the website, create a narration script, and assemble a professional demo video.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">3. User Accounts</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">You must create an account to use the Service. You are responsible for maintaining the security of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">4. Acceptable Use</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">You agree to use the Service only for lawful purposes. You may not generate demos of websites you don't own or have permission to showcase. You may not use the Service to create misleading, harmful, or infringing content.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">5. Intellectual Property</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">You retain ownership of all content you provide to the Service, including URLs and prompts. You own the demo videos generated through your account. Reveel AI retains all rights to its platform, technology, and AI agents.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">6. Subscription & Billing</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">Paid plans are billed monthly or annually. You may cancel at any time, with access continuing until the end of the current billing period. Refunds are handled on a case-by-case basis.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">7. Limitation of Liability</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">The Service is provided "as is" without warranties. Reveel AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-[20px] font-bold text-[var(--heading)] mb-3">8. Contact</h2>
                        <p className="text-[15px] text-[var(--body)] font-medium leading-relaxed">For questions about these Terms, contact us at legal@reveel.ai.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
