export function GuestCheckoutBanner() {
  return (
    <div className="glass-dim rounded-xl px-4 py-3 text-sm text-slate-700 flex items-start gap-3 border border-white/40">
      <span className="text-brand-ink mt-0.5">✓</span>
      <p>
        You are checking out as a guest. Account creation is offered after your
        order is placed. No password required now.
      </p>
    </div>
  );
}
