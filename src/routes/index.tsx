import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InvitationScene, GalaxyBackground } from "@/components/InvitationExperience";
import { CollectionsSection } from "@/components/sections/CollectionsSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { AllureSection } from "@/components/sections/AllureSection";
import { FooterSection } from "@/components/sections/FooterSection";
import {
  useTime,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useMotionValue,
} from "motion/react";

export const Route = createFileRoute("/")({
  // ... meta unchanged ...
  component: Index,
});

function Index() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isPreloaderComplete, setPreloaderComplete] = useState(false);

  // Time‑based progress that goes from 0 → 1 over 5 seconds
  const t = useTime();
  const durationMs = 5000;
  const rawProgress = useTransform(t, [0, durationMs], [0, 1], { clamp: true });
  const progress = useSpring(rawProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  // Mark preloader as complete when progress reaches 1
  useMotionValueEvent(progress, "change", (latest) => {
    if (latest >= 0.9999 && !isPreloaderComplete) {
      setPreloaderComplete(true);
    }
  });

  // Prevent scrolling while the preloader is playing
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (isPreloaderComplete) {
      document.body.style.overflow = "";
    }
  }, [isPreloaderComplete]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  const finalProgress = useMotionValue(1); // constant 1 for the static hero

  return (
    <main className="bg-background text-foreground">
      {/* Persistent galaxy background – only one instance, no star duplication */}
      <GalaxyBackground progress={useMotionValue(0)} />

      {/* Preloader overlay (fixed, on top, animated from 0 → 1) */}
      {!isPreloaderComplete && (
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          <InvitationScene progress={progress} />
        </div>
      )}

      {/* Hero section (always present, hidden behind preloader until it finishes) */}
      <section className="relative h-screen">
        <InvitationScene progress={finalProgress} />
      </section>

      {/* Rest of the page */}
      <CollectionsSection
        categories={categories}
        onSelectCategory={handleCategorySelect}
      />
      <PortfolioSection
        initialFilter={selectedCategory}
        onCategoriesLoaded={setCategories}
      />
      <AllureSection />
      <FooterSection />
    </main>
  );
}
