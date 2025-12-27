import { Metadata } from 'next';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { AboutHeroSection } from '@/components/about/about-hero-section';
import { StorySection } from '@/components/about/story-section';
import { MissionSection } from '@/components/about/mission-section';
import { DifferentiationSection } from '@/components/about/differentiation-section';
import { AudienceSection } from '@/components/about/audience-section';
import { PrinciplesSection } from '@/components/about/principles-section';
import { AboutCTASection } from '@/components/about/about-cta-section';

export const metadata: Metadata = {
  title: 'About NotifyAff — Affiliate Link Monitoring You Can Trust',
  description: 'Learn why NotifyAff was built, our mission, and how we help marketers protect affiliate revenue with real-time link monitoring.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutHeroSection />
      <StorySection />
      <MissionSection />
      <DifferentiationSection />
      <AudienceSection />
      <PrinciplesSection />
      <AboutCTASection />
      <Footer />
    </main>
  );
}
