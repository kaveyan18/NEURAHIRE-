import { motion } from 'framer-motion';

const iconKeyword = (
  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.5 3.5l1 1m0 0L12 6m-1.5-1.5L9 6m6.5-2.5l1 1m0 0L18 6m-1.5-1.5L15 6M3 10h18M3 14h18M7 18h10" />
  </svg>
);

const iconScore = (
  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const iconBench = (
  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const features = [
  {
    icon: iconKeyword,
    tag: 'Smart Detection',
    title: 'Keyword Gap Analysis',
    description: 'Our AI instantly surfaces the exact hard and soft skills recruiters are filtering for in your specific niche, with semantic understanding that goes beyond simple string matching.',
    color: 'indigo',
  },
  {
    icon: iconScore,
    tag: 'Data Driven',
    title: 'Impact Scorecard',
    description: 'We quantify your achievements using data-driven metrics that make your contributions undeniable. Transform vague bullets into powerful, measurable outcomes.',
    color: 'violet',
  },
  {
    icon: iconBench,
    tag: 'Competitive Edge',
    title: 'AI Benchmarking',
    description: 'Compare your profile against thousands of successful hires at FAANG and top-tier startups. Know exactly where you stand and what to fix first.',
    color: 'purple',
  },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', tag: 'text-indigo-400 bg-indigo-500/10', glow: 'shadow-indigo-500/10' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', tag: 'text-violet-400 bg-violet-500/10', glow: 'shadow-violet-500/10' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', tag: 'text-purple-400 bg-purple-500/10', glow: 'shadow-purple-500/10' },
};

function FeatureCard({ feature, index }) {
  const c = colorMap[feature.color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`glass-card rounded-2xl p-7 flex flex-col gap-5 border ${c.border} hover:shadow-xl ${c.glow} transition-shadow duration-300`}
    >
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
        {feature.icon}
      </div>
      <div>
        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-md ${c.tag}`}>
          {feature.tag}
        </span>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs text-indigo-400 uppercase tracking-[0.2em] mb-4 font-medium">Why NeuraHire</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5">Master the ATS Landscape</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Our proprietary AI doesn't just read your resume; it understands the semantic requirements of your industry's leading employers.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
