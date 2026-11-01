const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-12 h-12 mb-4">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(99,102,241,0.15)',
          }}
        />
        {/* Spinning ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#6366f1',
            borderRightColor: '#8b5cf6',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        {/* Inner dot */}
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: 'rgba(99,102,241,0.2)' }}
        />
      </div>
      <p className="text-sm" style={{ color: 'var(--cc-text-muted)' }}>{message}</p>
    </div>
  );
};

export default Loader;
