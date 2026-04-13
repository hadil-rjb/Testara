import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Process from '@/components/landing/Process';
import CTA from '@/components/landing/CTA';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Process />
      <CTA />
      <Testimonials />
      <FAQ />
    </>
  );
}
