import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ContextAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}

export interface ContextActionsProps {
  actions: ContextAction[];
  onClose: () => void;
  position: { top: number; left: number };
  className?: string;
}

export function ContextActions({ actions, onClose, position, className = '' }: ContextActionsProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState(position);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  // Adjust position if menu overflows viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    let { top, left } = position;
    if (rect.bottom > window.innerHeight) {
      top = window.innerHeight - rect.height - 8;
    }
    if (rect.right > window.innerWidth) {
      left = window.innerWidth - rect.width - 8;
    }
    if (top !== position.top || left !== position.left) {
      setAdjusted({ top, left });
    }
  }, [position]);

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: adjusted.top, left: adjusted.left }}
      className={`fixed z-[200] w-44 bg-surface-container-lowest border border-outline-variant shadow-ambient rounded-xl py-1.5 overflow-hidden animate-in fade-in zoom-in duration-200 transform origin-top-left ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-label">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={`w-full text-left px-3 py-2.5 text-[11px] font-semibold flex items-center gap-2.5 transition-colors ${
              action.danger ? 'text-error/50 hover:text-error hover:bg-error/10' : 'text-on-surface-variant hover:bg-surface-container-low/50'
            } ${index !== actions.length - 1 ? 'border-b border-outline-variant/5' : ''}`}
          >
            <span className="icon text-base opacity-70">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
