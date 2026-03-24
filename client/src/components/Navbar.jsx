import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { BellIcon, UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navLinks = ['Features', 'Analysis', 'Pricing', 'Career Guide'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card border-b border-white/5 py-3' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#">
          <Logo textSize="text-xl" />
        </a>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
            <BellIcon className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors" aria-label="Profile">
            <UserCircleIcon className="w-5 h-5" />
          </button>
          <button className="btn-gradient text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg shadow-indigo-500/20">
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-white/5 overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-slate-300 text-sm font-medium hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
              <li>
                <button className="btn-gradient text-white text-sm font-semibold px-5 py-2 rounded-full w-full mt-2">
                  Get Started
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
