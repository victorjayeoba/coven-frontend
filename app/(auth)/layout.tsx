export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-base px-4">
      {/* Radial glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 500px at 50% 0%, rgba(60,196,123,0.10), transparent 60%)",
        }}
      />
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e4eaf2 1px, transparent 1px), linear-gradient(to bottom, #e4eaf2 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="font-display text-[56px] font-normal italic leading-none tracking-tight text-text-primary">
              coven
            </span>
            <span className="inline-flex h-1.5 w-1.5 translate-y-3 rounded-full bg-primary">
              <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-75" />
            </span>
          </div>
          <p className="mt-3 text-small text-text-secondary">
            smart money moves in circles. see them first.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
