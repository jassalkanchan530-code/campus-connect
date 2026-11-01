import { motion } from 'framer-motion';

/**
 * AnimatedBackground — Floating orbs + grid, used on hero sections and auth pages.
 * Performance: CSS transforms only, no JS animation loops.
 */
const AnimatedBackground = ({ variant = 'default', children, className = '' }) => {
  const orbs = {
    default: [
      { className: 'orb orb-indigo orb-anim-1', style: { width: 500, height: 500, top: '-15%', right: '-10%' } },
      { className: 'orb orb-violet orb-anim-2', style: { width: 400, height: 400, bottom: '5%',  left: '-8%'  } },
      { className: 'orb orb-blue',              style: { width: 300, height: 300, top: '40%',  right: '20%', opacity: 0.08 } },
    ],
    hero: [
      { className: 'orb orb-indigo orb-anim-1', style: { width: 700, height: 700, top: '-20%', right: '-15%' } },
      { className: 'orb orb-violet orb-anim-2', style: { width: 500, height: 500, bottom: '-5%', left: '-12%' } },
      { className: 'orb orb-blue',              style: { width: 350, height: 350, top: '35%', left: '30%', opacity: 0.06 } },
    ],
    subtle: [
      { className: 'orb orb-indigo',            style: { width: 300, height: 300, top: '-10%', right: '-5%',  opacity: 0.08 } },
      { className: 'orb orb-violet',            style: { width: 250, height: 250, bottom: '0', left: '-5%',   opacity: 0.07 } },
    ],
    sidebar: [
      { className: 'orb orb-indigo orb-anim-1', style: { width: 200, height: 200, top: '10%',  right: '-30%' } },
      { className: 'orb orb-violet orb-anim-2', style: { width: 180, height: 180, bottom: '20%', left: '-20%' } },
    ],
  };

  const currentOrbs = orbs[variant] || orbs.default;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Orbs */}
      {currentOrbs.map((orb, i) => (
        <div key={i} className={orb.className} style={orb.style} />
      ))}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
