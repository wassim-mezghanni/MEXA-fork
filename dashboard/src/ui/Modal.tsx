import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  footer,
  children,
  className = '',
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/5 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container */}
      <section className={`relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] overflow-hidden ${className}`}>
        {/* Header */}
        {title && (
          <header className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/10">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">{title}</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
            >
              <span className="icon">close</span>
            </button>
          </header>
        )}

        {/* Content */}
        <div className="p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="flex items-center justify-end gap-3 px-8 py-6 bg-surface-container-low/50">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
