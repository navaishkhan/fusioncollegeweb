'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [
  ['#about', 'About'],
  ['#programs', 'Programs'],
  ['#admissions', 'Admissions'],
  ['#academics', 'Academics'],
  ['#faculty', 'Faculty'],
  ['#contact', 'Contact'],
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="nav-logo">
        <Image src="/logo.png" alt="Fusion College Logo" width={48} height={48} className="rounded-full" />
        <div className="nav-logo-text">
          <span>FUSION COLLEGE</span>
          <span>of Sciences · Narowal</span>
        </div>
      </a>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
        <Link href="/login" className="nav-lms">LMS Portal</Link>
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle dark mode" type="button">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" type="button">
        <span /><span /><span />
      </button>
    </nav>
  );
}
