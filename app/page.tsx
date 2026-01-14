import { LandingSidebar } from "@/components/landing/sidebar"
import { LandingHeader } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { InboxSection } from "@/components/landing/inbox-section"
import { FunnelSection } from "@/components/landing/funnel-section"
import { AutomationSection } from "@/components/landing/automation-section"
import { LandingPagesSection } from "@/components/landing/landing-pages-section"
import { SegmentationSection } from "@/components/landing/segmentation-section"
import { ChatbotsSection } from "@/components/landing/chatbots-section"
import { RemarketingSection } from "@/components/landing/remarketing-section"
import { ReportsSection } from "@/components/landing/reports-section"
import { SecuritySection } from "@/components/landing/security-section"
import { ScalabilitySection } from "@/components/landing/scalability-section"
import { CTASection } from "@/components/landing/cta-section"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen">
      <LandingSidebar />
      <main className="flex-1 flex flex-col gap-12 p-8 lg:p-12 pb-16">
        <LandingHeader />
        <HeroSection />
        <InboxSection />
        <FunnelSection />
        <AutomationSection />
        <LandingPagesSection />
        <SegmentationSection />
        <ChatbotsSection />
        <RemarketingSection />
        <ReportsSection />
        <SecuritySection />
        <ScalabilitySection />
        <CTASection />
      </main>
    </div>
  )
}
