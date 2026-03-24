import Logo from './Logo';

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'API Access', href: '#' },
  { label: 'Contact Support', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Logo & Copyright */}
        <div className="flex flex-col gap-1">
          <Logo textSize="text-lg" />
          <p className="text-slate-600 text-xs">© 2026 NeuraHire AI. All rights reserved.</p>
        </div>

        {/* Right: Links */}
        <nav className="flex flex-wrap justify-center gap-6">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
