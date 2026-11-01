import { motion } from 'framer-motion';

/**
 * SectionHeader — consistent section header with gradient accent line.
 */
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="h-4 w-0.5 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
        <h2 className="font-bold text-white text-lg">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm ml-2.5" style={{ color: 'var(--cc-text-muted)' }}>{subtitle}</p>
      )}
    </div>
    {action}
  </div>
);

/**
 * EmptyState — designed empty state with icon, message, and optional CTA.
 */
export const EmptyState = ({ icon, title, message, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl"
    style={{
      background: 'rgba(17,24,39,0.5)',
      border: '1px dashed rgba(99,102,241,0.2)',
    }}
  >
    {icon && (
      <div className="text-5xl mb-4 opacity-30" style={{ color: 'var(--cc-indigo)' }}>
        {icon}
      </div>
    )}
    <p className="font-semibold text-white text-lg mb-2">{title}</p>
    {message && (
      <p className="text-sm max-w-xs" style={{ color: 'var(--cc-text-muted)' }}>{message}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

/**
 * LoadingState — elegant shimmer skeleton loader.
 */
export const LoadingState = ({ rows = 3, variant = 'card' }) => {
  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div
            className="absolute inset-0 rounded-full border-t-2 border-indigo-500"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </div>
        <p className="mt-4 text-sm" style={{ color: 'var(--cc-text-muted)' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{
            background: 'rgba(17,24,39,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex gap-3">
            <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * GlassCard — semi-transparent card with blur.
 */
export const GlassCard = ({ children, className = '', hover = false }) => (
  <motion.div
    whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : {}}
    className={`glass rounded-2xl ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * StatusBadge — colored status indicator.
 */
export const StatusBadge = ({ status }) => {
  const map = {
    registered: 'badge-green',
    cancelled:  'badge-red',
    active:     'badge-green',
    inactive:   'badge-red',
    pending:    'badge-orange',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>
      {status}
    </span>
  );
};

/**
 * PageHeader — page-level header with icon, title, and subtitle.
 */
export const PageHeader = ({ icon, title, subtitle, action }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-start justify-between mb-8"
  >
    <div className="flex items-start gap-3">
      {icon && (
        <div
          className="p-2.5 rounded-xl text-lg shrink-0"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.25)',
            color: '#818cf8',
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--cc-text-muted)' }}>{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);

/**
 * AlertBanner — inline alert for success/error/info messages.
 */
export const AlertBanner = ({ type = 'info', message }) => {
  if (!message) return null;
  const styles = {
    error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#fca5a5' },
    success: { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   text: '#86efac' },
    info:    { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  text: '#a5b4fc' },
    warning: { bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   text: '#fde68a' },
  };
  const s = styles[type] || styles.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl px-4 py-3 text-sm mb-4"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {message}
    </motion.div>
  );
};
