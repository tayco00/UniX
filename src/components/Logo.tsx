export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "logo-compact" : ""}`} aria-label="UniX">
      <span className="logo-mark" aria-hidden="true">U<span>X</span></span>
      {!compact && <span className="logo-word">Uni<span>X</span></span>}
    </div>
  );
}
