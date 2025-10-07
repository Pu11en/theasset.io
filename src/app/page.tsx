import Navigation from '@/components/sections/Navigation';
import Hero from '@/components/sections/Hero';
import SocialProof from '@/components/sections/SocialProof';
import Solutions from '@/components/sections/Solutions';
import Benefits from '@/components/sections/Benefits';
import Process from '@/components/sections/Process';
import Pricing from '@/components/sections/Pricing';
import Testimonials from '@/components/sections/Testimonials';
import CTA from '@/components/sections/CTA';
import FAQ from '@/components/sections/FAQ';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <SocialProof />
      <Solutions />
      <Benefits />
      <Process />
      <Pricing />
      <Testimonials />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  );
}
