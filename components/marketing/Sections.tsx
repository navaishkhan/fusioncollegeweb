export function SectionShell({
  id,
  className = '',
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`section-shell ${className}`.trim()}>
      <div className="section-inner">{children}</div>
    </section>
  );
}

export function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-head">
      <div className="section-ribbon" aria-hidden="true" />
      <div className="section-head-content">{children}</div>
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="divider" aria-hidden="true">
      <span className="divider-mark" />
    </div>
  );
}

export function StatsBar() {
  return (
    <div className="section-shell section-shell--stats">
      <div className="section-inner section-inner--compact">
        <div className="stats-bar reveal">
          <div className="stat-item"><span className="stat-num">5.0★</span><div className="stat-label">Google Rating</div></div>
          <div className="stat-item"><span className="stat-num">3+</span><div className="stat-label">Programs Offered</div></div>
          <div className="stat-item"><span className="stat-num">8+</span><div className="stat-label">Departments</div></div>
          <div className="stat-item"><span className="stat-num">24/7</span><div className="stat-label">LMS Access</div></div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} Fusion College of Sciences Narowal. All rights reserved.</p>
        <p>Circular Road, Narowal · +92 304 3113555</p>
      </div>
    </footer>
  );
}
