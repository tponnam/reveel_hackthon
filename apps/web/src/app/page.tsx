import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Differentiators from "@/components/landing/Differentiators";
import Comparison from "@/components/landing/Comparison";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Hero />
      <PainPoints />
      <Features />
      <HowItWorks />
      <Differentiators />
      <Comparison />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
