import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const logos = [
  'DeepMind', 'Anthropic', 'OpenAI', 'Mistral', 'Cohere'
];

export default function TrustedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16 px-6 border-y border-slate-800/50">
      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs text-slate-500 uppercase tracking-[0.25em] mb-10"
        >
          Trusted by talent scouts at leading innovators
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-6">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-xl px-8 py-4 text-slate-600 text-sm font-semibold tracking-wider grayscale hover:grayscale-0 hover:text-slate-300 transition-all duration-300 cursor-default"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
