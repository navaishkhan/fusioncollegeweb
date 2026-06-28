'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const FusionCanvas = dynamic(() => import('./FusionCanvas'), { ssr: false });

export function Hero() {
  return (
    <section className="hero section-shell section-shell--hero">
      <div className="hero-content">
        <div className="hero-tag"><span /> Admissions Open · Session 2026</div>
        <h1 className="hero-h1">
          Where <span className="accent">Excellence</span><br />
          Meets <span className="cyan">Purpose.</span>
        </h1>
        <p className="hero-sub">
          Fusion College of Sciences Narowal — elite academics, holistic development, and cutting-edge digital tools.
        </p>
        <div className="hero-ctas">
          <a href="#admissions" className="btn btn-solid">Apply Now 2026</a>
          <Link href="/login" className="btn btn-red">Student LMS</Link>
          <a href="#programs" className="btn btn-outline">View Programs</a>
        </div>
      </div>
      <div className="hero-3d-canvas">
        <FusionCanvas />
      </div>
      <div className="hero-scroll-hint">
        <div className="scroll-line" /> Scroll to explore
      </div>
    </section>
  );
}
