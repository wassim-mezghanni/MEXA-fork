import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Overview', key: 'overview', path: '/' },
  { icon: 'menu_book', label: 'MEXA Findings', key: 'findings', path: '/findings' },
  { icon: 'layers', label: 'Projection', key: 'projection', path: '/projection' },
  { icon: 'grid_view', label: 'Alignment', key: 'alignment', path: '/alignment' },
  { icon: 'analytics', label: 'Distribution', key: 'distribution', path: '/distribution' },
  { icon: 'compare_arrows', label: 'Comparison', key: 'comparison', path: '/comparison' },
];

const FOOTER_LINKS = [
  { icon: 'history', label: 'Archive' },
  { icon: 'help_outline', label: 'Support' },
];

export default function Sidebar() {
  return (
    <nav className="h-screen w-64 fixed left-0 bg-surface-container-low flex flex-col p-4 space-y-2 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-headline font-bold">
          M
        </div>
        <div>
          <h1 className="font-headline font-bold text-primary leading-tight">Thesis</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-secondary-container opacity-70">
            LLM Evaluation Lab
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'w-full flex items-center gap-3 px-3 py-2 bg-surface-container-lowest text-primary font-medium rounded-lg shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 rounded-lg'
              }
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-body text-sm tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* New Experiment CTA */}
      <button className="mt-8 mx-2 bg-gradient-to-r from-primary to-primary-container text-white py-2.5 rounded-lg font-headline font-bold text-sm tracking-tight active:scale-[0.98] transition-all">
        New Experiment
      </button>

      {/* Footer links */}
      <div className="mt-auto pt-4 space-y-1 border-t border-outline-variant/10">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-secondary-container hover:text-primary text-xs uppercase tracking-widest transition-colors"
          >
            <span className="material-symbols-outlined text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
