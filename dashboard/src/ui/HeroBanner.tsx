interface HeroBannerAction {
  label: string;
  icon?: string;
  onClick?: () => void;
}

export interface HeroBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: HeroBannerAction;
  secondaryAction?: HeroBannerAction;
  backgroundImage?: string;
  overlayGradient?: string;
  height?: string;
  className?: string;
}

export function HeroBanner({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  overlayGradient = 'bg-gradient-to-r from-emerald-950 via-slate-900/60 to-transparent',
  height = 'h-[400px]',
  className = '',
}: HeroBannerProps) {
  return (
    <section className={`relative overflow-hidden ${height} rounded-3xl bg-slate-900 flex items-center ${className}`}>
      {backgroundImage && (
        <div className="absolute inset-0 opacity-40">
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`absolute inset-0 ${overlayGradient}`} />

      <div className="relative z-10 px-10 md:px-16 max-w-2xl">
        {eyebrow && (
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block font-headline">
            {eyebrow}
          </span>
        )}

        <h2 className="text-white font-headline text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
          {title}
        </h2>

        {description && (
          <p className="text-white/70 font-body text-base mb-8 leading-relaxed max-w-lg">
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap gap-4">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="px-8 py-4 bg-white text-emerald-950 font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-all font-headline"
              >
                {primaryAction.label}
                {primaryAction.icon && (
                  <span className="icon text-[20px]">{primaryAction.icon}</span>
                )}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all font-headline"
              >
                {secondaryAction.label}
                {secondaryAction.icon && (
                  <span className="icon text-[20px] ml-2">{secondaryAction.icon}</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
