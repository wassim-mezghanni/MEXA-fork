import { useEffect, useRef } from 'react';
import { Toggle } from '../form/Toggle.tsx';
import { Button } from './Button.tsx';

export interface ProfileUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface ProfileCardProps {
  user?: ProfileUser;
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onLogin?: () => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  darkMode?: boolean;
  onDarkModeChange?: (enabled: boolean) => void;
  className?: string;
}

export function ProfileCard({
  user,
  open,
  onClose,
  onLogout,
  onLogin,
  onSettings,
  onNotifications,
  darkMode = false,
  onDarkModeChange,
  className = '',
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const initials = user
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div
      ref={cardRef}
      className={`absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] overflow-hidden z-50 ${className}`}
      role="menu"
    >
      {user ? (
        <>
          {/* Profile Header */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary-container/20 shrink-0">
                {user.avatarUrl ? (
                  <img alt={user.name} src={user.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary text-sm font-bold font-heading">
                    {initials}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface font-heading truncate">{user.name}</p>
                <p className="text-[11px] text-outline font-label truncate">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-secondary-container text-on-secondary-container font-label">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-3 pb-1">
            <button
              onClick={onSettings}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-surface-container-low/60 transition-colors group"
            >
              <span className="icon text-lg text-outline group-hover:text-primary transition-colors">settings</span>
              <div>
                <p className="text-[12px] font-semibold text-on-surface font-label">Account Settings</p>
                <p className="text-[10px] text-outline font-label">Profile, security & preferences</p>
              </div>
            </button>
            <button
              onClick={onNotifications}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-surface-container-low/60 transition-colors group"
            >
              <span className="icon text-lg text-outline group-hover:text-primary transition-colors">notifications</span>
              <div>
                <p className="text-[12px] font-semibold text-on-surface font-label">Notifications</p>
                <p className="text-[10px] text-outline font-label">Manage alerts & updates</p>
              </div>
            </button>
          </div>

          {/* Preferences */}
          <div className="mx-6 my-2 border-t border-outline-variant/10" />
          <div className="px-6 py-3">
            <p className="text-[9px] font-bold tracking-[0.15em] text-outline uppercase mb-3 font-label">Preferences</p>
            <Toggle
              label="Dark Mode"
              checked={darkMode}
              onChange={(e) => onDarkModeChange?.(e.target.checked)}
            />
          </div>

          {/* Keyboard Shortcut Hint */}
          <div className="mx-6 my-1 border-t border-outline-variant/10" />
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-outline font-label">Quick search</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface-variant">
                  {"\u2318"}
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface-variant">
                  K
                </kbd>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="mx-6 mt-1 border-t border-outline-variant/10" />
          <div className="p-4 px-6">
            <Button
              variant="secondary"
              icon="logout"
              onClick={onLogout}
              className="w-full !py-2.5 !text-xs"
            >
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        /* Logged-out state */
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="icon text-2xl text-outline">person</span>
          </div>
          <p className="text-sm font-bold text-on-surface font-heading mb-1">Welcome</p>
          <p className="text-[11px] text-outline font-label mb-5">Sign in to access your account</p>
          <Button
            variant="primary"
            icon="login"
            onClick={onLogin}
            className="w-full !py-2.5 !text-xs"
          >
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
}
