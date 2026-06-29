import { useRef, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "motion/react";
import { Link } from "@tanstack/react-router";

/**
 * Scroll choreography (0 → 1):
 * 0.00 – 0.15   Start on envelope back. Camera pushes in tight on the wax seal.
 * 0.15 – 0.19   Tension builds — seal inhales, aura intensifies.
 * 0.19 – 0.28   CRACK. Lightning fractures radiate, card shudders, shards erupt.
 * 0.28 – 0.40   Camera pulls back to reveal the full envelope again.
 * 0.40 – 0.55   The top flap peels open on rotateX.
 * 0.55 – 0.70   The invitation card slides vertically out of the envelope folds.
 * 0.70 – 0.85   The envelope falls away and fades; the card settles into the center viewport.
 * 0.85 – 1.00   Invitation typography and flourishes gracefully stagger into view.
 */
export function InvitationExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-[560vh] cinematic-bg"
      aria-label="Impressions Wedding Cards"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden vignette grain">
        <Ambience progress={p} />
        <GalaxyBackground progress={p} />   {/* ← Galaxy stars always visible */}
        <FloatingNav progress={p} />
        <Stage progress={p} />
        <ScrollHint progress={p} />
        <FooterMark progress={p} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ambience                                                          */
/* ------------------------------------------------------------------ */
function Ambience({ progress }: { progress: MotionValue<number> }) {
  const intensity = useTransform(
    progress,
    [0, 0.19, 0.28, 0.65, 1],
    [0.28, 0.45, 1, 0.65, 0.55]
  );
  const scale = useTransform(progress, [0, 1], [1, 1.55]);
  return (
    <motion.div
      aria-hidden
      style={{ opacity: intensity, scale }}
      className="pointer-events-none absolute inset-0 z-0"
    >
      <div
        className="absolute left-1/2 top-1/2 h-[140vmin] w-[140vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--royal) 50%, transparent), transparent 68%)",
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--lavender) 45%, transparent), transparent 70%)",
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                               */
/* ------------------------------------------------------------------ */
function FloatingNav({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.8, 0.9], [0, 1]);
  const y = useTransform(progress, [0.8, 0.9], [-18, 0]);
  return (
    <motion.header
      style={{ opacity, y }}
      className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-12 py-6"
    >
      <div className="font-serif text-[18px] tracking-[0.36em] uppercase text-pearl/90">
        Impressions
      </div>
      <nav className="hidden md:flex gap-9 text-[10.5px] tracking-[0.32em] uppercase text-pearl/70">
        {["Portfolio", "Allure", "Contact"].map((item) => (
          <Link
            key={item}
            to={item === "Contact" ? "/" : `/${item.toLowerCase()}`}
            className="hover:text-pearl transition-colors duration-500"
          >
            {item}
          </Link>
        ))}
      </nav>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll hint / footer                                              */
/* ------------------------------------------------------------------ */
function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.04, 0.12], [1, 1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 text-pearl/55"
    >
      <span className="text-[9px] tracking-[0.6em] uppercase">Break the Seal</span>
      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="h-10 w-px bg-gradient-to-b from-pearl/55 to-transparent"
      />
    </motion.div>
  );
}

function FooterMark({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.88, 1], [0, 1]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 text-[9px] tracking-[0.5em] uppercase text-pearl/35"
    >
      © MMXXVI · Impressions Atelier
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage — master camera & assembly                                  */
/* ------------------------------------------------------------------ */
function Stage({ progress }: { progress: MotionValue<number> }) {
  // Camera push in and out to frame the sequence
  const stageScale = useTransform(
    progress,
    [0, 0.15, 0.28, 0.40, 1],
    [1.0, 2.4, 2.4, 1.0, 1.05]
  );
  // Shift stage slightly up during zoom so the seal (at 58% down) remains centered
  const stageY = useTransform(
    progress,
    [0, 0.15, 0.28, 0.40],
    ["0vh", "-6vh", "-6vh", "0vh"]
  );

  // Card shudder: fires at crack moment (0.19 → 0.30)
  const shakeX = useTransform(progress, (v) => {
    if (v < 0.19 || v > 0.30) return 0;
    const t = (v - 0.19) / 0.11;
    return Math.sin(t * Math.PI * 7) * (1 - t) * 9;
  });
  const shakeY = useTransform(progress, (v) => {
    if (v < 0.19 || v > 0.30) return 0;
    const t = (v - 0.19) / 0.11;
    return Math.sin(t * Math.PI * 4) * (1 - t) * 4;
  });

  // Seal pre-crack tension
  const sealBreathe = useTransform(progress, [0.10, 0.15, 0.19], [1, 1.10, 1.04]);
  const sealGlow = useTransform(progress, [0.12, 0.19, 0.28], [0, 0.85, 0]);

  // Crack + burst
  const crackOpacity = useTransform(progress, [0.18, 0.21, 0.30, 0.35], [0, 1, 1, 0]);
  const burstOpacity = useTransform(progress, [0.19, 0.24, 0.34], [0, 1, 0]);
  const burstScale = useTransform(progress, [0.19, 0.35], [0.3, 2.8]);

  // Flap opens backwards
  const flapRotateX = useTransform(progress, [0.40, 0.55], [0, -182]);

  // Envelope falls away as the card is drawn
  const envelopeY = useTransform(progress, [0.70, 0.85], ["0%", "50%"]);
  const envelopeOpacity = useTransform(progress, [0.70, 0.85], [1, 0]);

  // Card Extraction (Slides up out of folds, then settles to center as envelope falls)
  const cardY = useTransform(progress, [0.55, 0.70, 0.85], ["0%", "-65%", "0%"]);
  const cardScale = useTransform(progress, [0, 0.70, 0.85], [0.95, 0.95, 1.05]);

  return (
    <motion.div
      style={{ scale: stageScale, y: stageY }}
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      <motion.div
        style={{
          x: shakeX,
          y: shakeY,
          perspective: 2400,
        }}
        className="relative flex items-center justify-center w-[min(90vw,840px)] aspect-[3/2]"
      >
        {/* Outer ambient halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-56 rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--royal) 35%, transparent), transparent 65%)",
          }}
        />

        {/* Layer 1: Envelope Back Wall */}
        <motion.div
          style={{ y: envelopeY, opacity: envelopeOpacity }}
          className="absolute inset-0 z-0 rounded-[3px] bg-[oklch(0.90_0.01_88)] shadow-[inset_0_4px_20px_rgba(0,0,0,0.08)]"
        />

        {/* Layer 2: The Opened Invitation Card */}
        <motion.div
          style={{ y: cardY, scale: cardScale }}
          className="absolute inset-0 z-10"
        >
          <InvitationInside progress={progress} />
        </motion.div>

        {/* Layer 3: Envelope Lower & Side Folds */}
        <motion.div
          style={{ y: envelopeY, opacity: envelopeOpacity }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <EnvelopeLowerFolds />
        </motion.div>

        {/* Layer 4: Top Flap & Wax Seal */}
        <motion.div
          style={{
            y: envelopeY,
            opacity: envelopeOpacity,
            rotateX: flapRotateX,
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0 z-30 pointer-events-none"
        >
          <InvitationTopFlap
            crackOpacity={crackOpacity}
            sealBreathe={sealBreathe}
            sealGlow={sealGlow}
            burstOpacity={burstOpacity}
            burstScale={burstScale}
            progress={progress}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Envelope Lower & Side Folds                                       */
/* ------------------------------------------------------------------ */
function EnvelopeLowerFolds() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[3px]">
      {/* Texture overlay for authenticity */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-30 opacity-30"
        style={{
          background:
            "radial-gradient(130% 85% at 50% 0%, transparent 45%, oklch(0 0 0 / 0.14) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Left Flap */}
      <div style={{ filter: "drop-shadow(4px 0px 12px rgba(0,0,0,0.12))" }} className="absolute inset-0 z-10">
        <div
          className="w-full h-full"
          style={{
            clipPath: "polygon(0% 0%, 48% 50%, 0% 100%)",
            background: "linear-gradient(to right, oklch(0.96 0.01 88), oklch(0.93 0.01 88))",
          }}
        />
      </div>

      {/* Right Flap */}
      <div style={{ filter: "drop-shadow(-4px 0px 12px rgba(0,0,0,0.12))" }} className="absolute inset-0 z-10">
        <div
          className="w-full h-full"
          style={{
            clipPath: "polygon(100% 0%, 52% 50%, 100% 100%)",
            background: "linear-gradient(to left, oklch(0.96 0.01 88), oklch(0.93 0.01 88))",
          }}
        />
      </div>

      {/* Bottom Flap (Overlaps sides) */}
      <div style={{ filter: "drop-shadow(0px -4px 16px rgba(0,0,0,0.15))" }} className="absolute inset-0 z-20">
        <div
          className="w-full h-full"
          style={{
            clipPath: "polygon(0% 100%, 50% 48%, 100% 100%)",
            background: "linear-gradient(to top, oklch(0.97 0.01 88), oklch(0.93 0.01 88))",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Top Flap & Assembly                                               */
/* ------------------------------------------------------------------ */
type FlapProps = {
  crackOpacity: MotionValue<number>;
  sealBreathe: MotionValue<number>;
  sealGlow: MotionValue<number>;
  burstOpacity: MotionValue<number>;
  burstScale: MotionValue<number>;
  progress: MotionValue<number>;
};

function InvitationTopFlap(props: FlapProps) {
  return (
    <div
      className="absolute inset-0 rounded-[3px]"
      style={{ backfaceVisibility: "hidden" }}
    >
      {/* V-Shaped Top Flap Paper Casts Shadow */}
      <div style={{ filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.25))" }} className="absolute inset-0">
        <div
          className="w-full h-full overflow-hidden"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 50% 58%)",
            background:
              "linear-gradient(158deg, oklch(0.97 0.01 88) 0%, oklch(0.94 0.01 88) 55%, oklch(0.90 0.02 84) 100%)",
          }}
        >
          {/* Vellum texture */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(130% 85% at 50% 0%, transparent 45%, oklch(0 0 0 / 0.14) 100%)",
              mixBlendMode: "multiply",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(112deg, transparent 38%, oklch(1 0 0 / 0.38) 48%, transparent 58%)",
            }}
          />

          {/* Top monogram block printed on flap */}
          <div className="absolute left-1/2 top-9 -translate-x-1/2 flex flex-col items-center gap-2">
            <div
              className="h-px w-16"
              style={{
                background:
                  "color-mix(in oklab, var(--royal-deep) 30%, transparent)",
              }}
            />
            <span
              className="font-serif italic text-[11px] tracking-[0.5em]"
              style={{
                color: "color-mix(in oklab, var(--royal-deep) 55%, transparent)",
              }}
            >
              IMPRESSIONS
            </span>
            <div
              className="h-px w-16"
              style={{
                background:
                  "color-mix(in oklab, var(--royal-deep) 30%, transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Light burst at crack moment */}
      <motion.div
        style={{ opacity: props.burstOpacity, scale: props.burstScale }}
        className="pointer-events-none absolute left-1/2 top-[58%] z-20 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            filter: "blur(24px)",
            background:
              "radial-gradient(circle, oklch(1 0.04 295 / 0.98), color-mix(in oklab, var(--lavender) 65%, transparent) 38%, transparent 68%)",
          }}
        />
      </motion.div>

      {/* Seal (Positioned at the tip of the flap to join with bottom fold visually) */}
      <div className="absolute left-1/2 top-[58%] z-30 -translate-x-1/2 -translate-y-1/2">
        <SealAssembly
          crackOpacity={props.crackOpacity}
          sealBreathe={props.sealBreathe}
          sealGlow={props.sealGlow}
          progress={props.progress}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seal + shards                                                     */
/* ------------------------------------------------------------------ */
function SealAssembly({
  crackOpacity,
  sealBreathe,
  sealGlow,
  progress,
}: {
  crackOpacity: MotionValue<number>;
  sealBreathe: MotionValue<number>;
  sealGlow: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const shards = [
    { clip: "polygon(50% 50%, 2% 2%, 55% 0%)", tx: -200, ty: -150, rot: -72 },
    { clip: "polygon(50% 50%, 55% 0%, 100% 25%)", tx: 175, ty: -110, rot: 60 },
    { clip: "polygon(50% 50%, 100% 25%, 102% 98%)", tx: 220, ty: 120, rot: 88 },
    { clip: "polygon(50% 50%, 102% 98%, 28% 102%)", tx: 55, ty: 240, rot: 38 },
    { clip: "polygon(50% 50%, 28% 102%, -2% 70%)", tx: -165, ty: 215, rot: -55 },
    { clip: "polygon(50% 50%, -2% 70%, 2% 2%)", tx: -240, ty: 15, rot: -95 },
  ];

  return (
    <motion.div
      style={{ scale: sealBreathe }}
      className="relative h-[140px] w-[140px]"
    >
      {/* Pre-crack aura */}
      <motion.div
        aria-hidden
        style={{
          opacity: sealGlow,
          filter: "blur(20px)",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--lavender) 85%, transparent), transparent 65%)",
        }}
        className="absolute -inset-10 rounded-full"
      />

      {/* Shards — each is a clipped copy of the disc */}
      {shards.map((s, i) => (
        <Shard key={i} progress={progress} {...s} />
      ))}

      {/* Crack network SVG */}
      <motion.div
        style={{ opacity: crackOpacity }}
        aria-hidden
        className="absolute inset-0 pointer-events-none z-20"
      >
        <svg viewBox="0 0 140 140" className="h-full w-full">
          <g fill="none" stroke="oklch(0 0 0 / 0.6)" strokeWidth="1.1" strokeLinecap="round">
            <path d="M70 70 L22 18" />
            <path d="M70 70 L112 12" />
            <path d="M70 70 L130 68" />
            <path d="M70 70 L100 124" />
            <path d="M70 70 L26 120" />
            <path d="M70 70 L4 60" />
            <path d="M38 40 L48 52" />
            <path d="M96 28 L86 44" />
            <path d="M112 80 L96 76" />
            <path d="M80 118 L76 104" />
            <path d="M18 88 L32 82" />
          </g>
          <g fill="none" stroke="oklch(1 0 0 / 0.5)" strokeWidth="0.6" strokeLinecap="round">
            <path d="M70 70 L22 18" />
            <path d="M70 70 L130 68" />
            <path d="M70 70 L26 120" />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Shard({
  clip,
  tx,
  ty,
  rot,
  progress,
}: {
  clip: string;
  tx: number;
  ty: number;
  rot: number;
  progress: MotionValue<number>;
}) {
  const x = useTransform(progress, [0.19, 0.38], [0, tx]);
  const y = useTransform(progress, [0.19, 0.38], [0, ty]);
  const rotate = useTransform(progress, [0.19, 0.38], [0, rot]);
  const opacity = useTransform(progress, [0.19, 0.30, 0.40], [1, 0.85, 0]);
  const scale = useTransform(progress, [0.19, 0.38], [1, 0.85]);
  return (
    <motion.div
      style={{ x, y, rotate, opacity, scale, clipPath: clip }}
      className="absolute inset-0"
    >
      <WaxSealDisc size={140} />
    </motion.div>
  );
}

function WaxSealDisc({ size = 120 }: { size?: number }) {
  return (
    <div
      className="relative h-full w-full rounded-full flex items-center justify-center font-serif select-none"
      style={{
        background: [
          "radial-gradient(circle at 32% 26%,",
          "  color-mix(in oklab, var(--royal) 92%, white 22%),",
          "  var(--royal-deep) 58%,",
          "  oklch(0.14 0.12 292) 100%)",
        ].join(""),
        color: "color-mix(in oklab, var(--lavender) 90%, white)",
        boxShadow: [
          `0 ${size * 0.14}px ${size * 0.28}px -${size * 0.06}px oklch(0 0 0 / 0.75)`,
          `inset 0 ${size * 0.025}px ${size * 0.05}px oklch(1 0 0 / 0.32)`,
          `inset 0 -${size * 0.05}px ${size * 0.1}px oklch(0 0 0 / 0.55)`,
        ].join(", "),
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full opacity-75"
        style={{
          background:
            "radial-gradient(circle, transparent 60%, color-mix(in oklab, var(--royal-deep) 85%, transparent) 63%, transparent 74%)",
          filter: "blur(1.6px)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-[6px] rounded-full"
        style={{
          border:
            "1px dashed color-mix(in oklab, var(--lavender) 25%, transparent)",
        }}
      />
      <span
        className="relative z-10 font-serif italic drop-shadow"
        style={{ fontSize: `${size * 0.19}px`, letterSpacing: "0.06em" }}
      >
        IW
      </span>
      <div
        aria-hidden
        className="absolute inset-[12px] rounded-full pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 0.75px color-mix(in oklab, var(--lavender) 28%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: "14%",
          top: "10%",
          width: "38%",
          height: "28%",
          filter: "blur(10px)",
          background: "oklch(1 0 0 / 0.52)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inside — the extracted invitation face                            */
/* ------------------------------------------------------------------ */
function InvitationInside({ progress }: { progress: MotionValue<number> }) {
  // Staggered content entrance after the card is centered on viewport
  const eyebrowOp = useTransform(progress, [0.85, 0.89], [0, 1]);
  const eyebrowY = useTransform(progress, [0.85, 0.89], [12, 0]);
  const headlineOp = useTransform(progress, [0.87, 0.92], [0, 1]);
  const headlineY = useTransform(progress, [0.87, 1], [12, -5]); // Slight drift
  const bodyOp = useTransform(progress, [0.90, 0.94], [0, 1]);
  const bodyY = useTransform(progress, [0.90, 0.94], [12, 0]);
  const ctaOp = useTransform(progress, [0.92, 0.97], [0, 1]);
  const ctaY = useTransform(progress, [0.92, 0.97], [12, 0]);
  const flourishOp = useTransform(progress, [0.95, 1.00], [0, 1]);

  return (
    <div
      className="relative w-full h-full rounded-[3px] overflow-hidden"
      style={{
        background:
          "linear-gradient(168deg, oklch(0.975 0.008 88) 0%, oklch(0.952 0.010 88) 40%, oklch(0.928 0.013 290) 100%)",
        boxShadow: [
          "0 80px 160px -40px oklch(0 0 0 / 0.92)",
          "0 24px 48px -12px oklch(0 0 0 / 0.45)",
          "inset 0 1px 0 oklch(1 0 0 / 0.85)",
          "inset 0 -1px 0 oklch(0 0 0 / 0.1)",
        ].join(", "),
      }}
    >
      {/* Vellum interior shading */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, oklch(0 0 0 / 0.10) 100%),",
            "radial-gradient(ellipse 40% 40% at 50% 50%, color-mix(in oklab, var(--royal) 8%, transparent), transparent 70%)",
          ].join(""),
          mixBlendMode: "multiply",
        }}
      />
      {/* Border system */}
      <div
        className="absolute inset-[14px] rounded-[2px]"
        style={{
          border:
            "0.75px solid color-mix(in oklab, var(--royal-deep) 20%, transparent)",
        }}
      />
      <div
        className="absolute inset-[22px] rounded-[1px]"
        style={{
          border:
            "0.5px solid color-mix(in oklab, var(--royal-deep) 10%, transparent)",
        }}
      />

      {/* ---------- Content ---------- */}
      <div className="relative h-full w-full flex flex-col items-center justify-center text-center">
        {/* Eyebrow rule + wordmark */}
        <motion.div
          style={{ opacity: eyebrowOp, y: eyebrowY }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-4">
            <span
              className="block h-px w-14"
              style={{
                background:
                  "color-mix(in oklab, var(--royal-deep) 40%, transparent)",
              }}
            />
            <span
              className="font-serif text-[9px] tracking-[0.65em] uppercase"
              style={{
                color:
                  "color-mix(in oklab, var(--royal-deep) 62%, transparent)",
              }}
            >
              Impressions
            </span>
            <span
              className="block h-px w-14"
              style={{
                background:
                  "color-mix(in oklab, var(--royal-deep) 40%, transparent)",
              }}
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          style={{
            opacity: headlineOp,
            y: headlineY,
          }}
          className="mt-5 font-serif leading-[0.96] tracking-[-0.015em] text-balance px-8 sm:px-20"
          style={{
            fontSize: "clamp(1.65rem, 4vw, 3rem)",
          }}
        >
          <span style={{ color: "var(--royal-deep)" }}>
            Crafted First Impressions
          </span>
          <br />
          <span
            className="italic"
            style={{
              color:
                "color-mix(in oklab, var(--royal-deep) 70%, transparent)",
            }}
          >
            for Timeless Celebrations
          </span>
        </motion.h1>

        {/* Body */}
        <motion.p
          style={{ opacity: bodyOp, y: bodyY }}
          className="mt-4 max-w-xs sm:max-w-sm px-4 leading-relaxed"
          style={{
            fontSize: "clamp(9.5px, 1.2vw, 11.5px)",
            color: "color-mix(in oklab, var(--royal-deep) 68%, transparent)",
          }}
        >
          Bespoke wedding invitations composed in heirloom paper, hand-set
          type and wax-sealed in our private atelier.
        </motion.p>

        {/* CTAs */}
        <motion.div
          style={{ opacity: ctaOp, y: ctaY }}
          className="mt-6 flex items-center gap-3 sm:gap-4"
        >
<Link
  to="/customise"
  className="inline-flex items-center justify-center transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110"
  style={{
    padding: "0.55rem 1.5rem",
    borderRadius: "999px",
    fontSize: "clamp(8px, 1vw, 9.5px)",
    letterSpacing: "0.34em",
    textTransform: "uppercase",
    fontWeight: 500,
    background: "linear-gradient(180deg, var(--royal) 0%, var(--royal-deep) 100%)",
    color: "var(--pearl)",
    boxShadow: "0 12px 24px -8px color-mix(in oklab, var(--royal) 75%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.28)",
  }}
>
  Customise Your Card
</Link>

<a
  href="#portfolio"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  }}
  className="inline-flex items-center justify-center transition-all duration-500 hover:-translate-y-0.5"
  style={{
    padding: "0.55rem 1.5rem",
    borderRadius: "999px",
    fontSize: "clamp(8px, 1vw, 9.5px)",
    letterSpacing: "0.34em",
    textTransform: "uppercase",
    fontWeight: 500,
    border: "0.75px solid color-mix(in oklab, var(--royal-deep) 38%, transparent)",
    color: "var(--royal-deep)",
    background: "transparent",
  }}
>
  Our Portfolio
</a>
        </motion.div>
      </div>

      {/* Corner flourishes */}
      <motion.div style={{ opacity: flourishOp }} className="absolute inset-0 pointer-events-none">
        <CornerFlourish className="top-5 left-5" />
        <CornerFlourish className="top-5 right-5 rotate-90" />
        <CornerFlourish className="bottom-5 right-5 rotate-180" />
        <CornerFlourish className="bottom-5 left-5 -rotate-90" />
        {/* Centre-top ornament */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div
            className="h-3 w-px"
            style={{
              background:
                "color-mix(in oklab, var(--royal-deep) 35%, transparent)",
            }}
          />
          <div
            className="h-1 w-1 rounded-full"
            style={{
              background:
                "color-mix(in oklab, var(--royal-deep) 40%, transparent)",
            }}
          />
        </div>
        {/* Centre-bottom ornament */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div
            className="h-1 w-1 rounded-full"
            style={{
              background:
                "color-mix(in oklab, var(--royal-deep) 40%, transparent)",
            }}
          />
          <div
            className="h-3 w-px"
            style={{
              background:
                "color-mix(in oklab, var(--royal-deep) 35%, transparent)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 44 44"
      className={`absolute h-7 w-7 ${className}`}
    >
      <path
        d="M3 18 Q3 3 18 3 M3 8 L10 8 M8 3 L8 10"
        fill="none"
        stroke="color-mix(in oklab, var(--royal-deep) 48%, transparent)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function GalaxyBackground({ progress }: { progress: MotionValue<number> }) {
  const stars = useMemo(() => {
    const items = [];
    for (let i = 0; i < 80; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 6 + Math.random() * 10;          // star diameter 6‑16px
      const duration = 18 + Math.random() * 22;
      const delay = Math.random() * 15;

      items.push({
        id: i,
        style: { left: `${left}%`, top: `${top}%` },
        size,
        animate: {
          y: [`0vh`, `-${80 + Math.random() * 40}vh`, `0vh`],
          opacity: [0, 0.9, 0.7, 0.9, 0],
          scale: [0.5, 1, 0.8, 1, 0.5],
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      });
    }
    return items;
  }, []);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
    >
      {/* Nebula glow */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 60% at 30% 40%, rgba(80,70,140,0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 50% at 70% 20%, rgba(40,30,80,0.12) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 50% at 50% 80%, rgba(60,50,100,0.1) 0%, transparent 50%)",
          ].join(", "),
          filter: "blur(8px)",
        }}
      />

      {/* Stars */}
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={s.style}
          animate={s.animate}
          transition={s.transition}
        >
          {/* 4‑point star SVG */}
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))",
              overflow: "visible",
            }}
            aria-hidden="true"
          >
            <path
              d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
              fill="white"
              fillOpacity={0.9}
            />
          </svg>
        </motion.div>
      ))}
      
    </motion.div>
  );
}
