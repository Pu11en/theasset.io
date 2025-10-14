import Navigation from '@/components/sections/Navigation';
import Hero from '@/components/sections/Hero';
import Solutions from '@/components/sections/Solutions';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import Process from '@/components/sections/Process';
import Testimonials from '@/components/sections/Testimonials';
import FAQ from '@/components/sections/FAQ';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Solutions />
      <WhyChooseUs />
      <Process />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}
