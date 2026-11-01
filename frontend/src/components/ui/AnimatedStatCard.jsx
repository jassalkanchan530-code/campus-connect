import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedStatCard — dashboard stat card with count-up animation.
 */
const AnimatedStatCard = ({ icon, label, value, note, color = 'indigo', index = 0 }) => {
  const [displayed, setDisplayed] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const numericValue = typeof value === 'number' ? value : null;

  // Count-up animation on intersect
  useEffect(() => {
    if (numericValue === null || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          let start = 0;
          const end = numericValue;
          const duration = 700;
          const step = Math.ceil(duration / Math.max(end, 1));
          const timer = setInterval(() => {
            start += 1;
            setDisplayed(start);
            if (start >= end) clearInterval(timer);
          }, step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue, hasAnimated]);

  const colors = {
    indigo: { icon: 'text-indigo-400', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.15)' },
    blue:   { icon: 'text-blue-400',   bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  glow: 'rgba(59,130,246,0.15)' },
    green:  { icon: 'text-green-400',  bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   glow: 'rgba(34,197,94,0.15)'  },
    orange: { icon: 'text-orange-400', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  glow: 'rgba(249,115,22,0.15)' },
    purple: { icon: 'text-purple-400', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)',  glow: 'rgba(139,92,246,0.15)' },
    pink:   { icon: 'text-pink-400',   bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.25)',  glow: 'rgba(236,72,153,0.15)' },
  };

  const c = colors[color] || colors.indigo;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg, ${c.bg} 0%, rgba(17,24,39,0.8) 100%)`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px ${c.glow}`,
      }}
    >
      {/* Icon */}
      <div className={`text-2xl mb-3 ${c.icon}`}>{icon}</div>

      {/* Value */}
      <p className="text-3xl font-bold text-white mb-0.5 stat-value">
        {numericValue !== null
          ? (hasAnimated ? numericValue : displayed)
          : value}
      </p>

      {/* Label */}
      <p className="text-sm font-medium" style={{ color: 'var(--cc-text-muted)' }}>{label}</p>
      {note && <p className="text-xs mt-0.5" style={{ color: 'var(--cc-text-faint)' }}>{note}</p>}

      {/* Decorative corner */}
      <div
        className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20"
        style={{ background: c.glow }}
      />
    </motion.div>
  );
};

export default AnimatedStatCard;
