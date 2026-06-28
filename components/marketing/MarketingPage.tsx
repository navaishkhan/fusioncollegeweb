'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { Footer, SectionDivider, SectionHead, SectionShell, StatsBar } from '@/components/marketing/Sections';
import { submitContactEnquiry } from '@/actions/contact.actions';

const programs = [
  { num: '01', colorClass: 'navy', title: 'F.Sc Pre-Medical', tag: '2-Year Program', desc: 'MDCAT-focused path to medicine.', subjects: ['Biology', 'Chemistry', 'Physics', 'English', 'Urdu', 'Pak Studies'] },
  { num: '02', colorClass: 'red', title: 'F.Sc Pre-Engineering', tag: '2-Year Program', desc: 'ECAT excellence for engineering.', subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Pak Studies'] },
  { num: '03', colorClass: 'cyan', title: 'ICS — Computer Science', tag: '2-Year Program', desc: 'Tech-forward curriculum.', subjects: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu', 'Pak Studies'] },
];

export function MarketingPage() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="site-atmosphere" aria-hidden="true">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      <Navbar />
      <Hero />
      <StatsBar />

      <SectionShell id="about">
        <div className="about-grid">
          <div>
            <SectionHead>
              <div className="section-label reveal">Our Identity</div>
              <h2 className="section-title reveal">The <span>Fusion</span> Advantage.</h2>
              <p className="section-desc reveal">Precision academics, character development, and digital tools for student success.</p>
            </SectionHead>
          </div>
        </div>
      </SectionShell>

      <SectionDivider />

      <SectionShell id="programs">
        <SectionHead>
          <div className="section-label reveal">Programs</div>
          <h2 className="section-title reveal">Choose Your <span>Path.</span></h2>
        </SectionHead>
        <div className="programs-grid">
          {programs.map((p) => (
            <div key={p.num} className={`program-card reveal ${p.colorClass}`}>
              <div className="program-num">{p.num}</div>
              <h3>{p.title}</h3>
              <span className="program-tag">{p.tag}</span>
              <p>{p.desc}</p>
              <ul>{p.subjects.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="admissions">
        <SectionHead>
          <div className="section-label reveal">Admissions</div>
          <h2 className="section-title reveal">Join <span>Fusion</span> 2026</h2>
          <p className="section-desc reveal">Visit campus or call +92 304 3113555 for admissions guidance.</p>
        </SectionHead>
      </SectionShell>

      <SectionShell id="contact">
        <SectionHead>
          <div className="section-label reveal">Contact</div>
          <h2 className="section-title reveal">Get in <span>Touch.</span></h2>
        </SectionHead>
        <form
          className="contact-form reveal"
          action={async (fd) => {
            await submitContactEnquiry(fd);
          }}
        >
          <input name="name" placeholder="Your Name" required />
          <input name="phone" placeholder="Phone / WhatsApp" required />
          <input name="email" placeholder="Email (optional)" type="email" />
          <textarea name="message" placeholder="Your message" rows={4} />
          <button type="submit" className="btn btn-solid">Send Message</button>
        </form>
      </SectionShell>

      <Footer />
    </>
  );
}
