import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="relative glow-border rounded-3xl p-12 text-center overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}
        >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 rounded-full">
              Join the waitlist today
            </span>

            <h2 className="text-4xl lg:text-5xl font-bold text-white max-w-xl leading-tight">
              Ready to outsmart the algorithms?
            </h2>

            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Your next career milestone is just one scan away. Join{' '}
              <span className="text-white font-semibold">50,000+</span> professionals who used Luminary to land interviews.
            </p>

            <button className="btn-gradient text-white font-semibold px-10 py-4 rounded-full text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow">
              Get Analyzed Free
            </button>

            <p className="text-slate-600 text-xs">
              No credit card required. PDF &amp; DOCX supported.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
