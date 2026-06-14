import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ── Model group definition ── */
interface DatasetLink {
  icon: string;
  label: string;
  path: string;
}

interface ModelGroup {
  modelName: string;
  modelIcon: string;
  /** Color class for the model's accent indicator */
  accentColor: string;
  datasets: DatasetLink[];
}

const MODEL_GROUPS: ModelGroup[] = [
  {
    modelName: 'Llama 3.1 8B',
    modelIcon: 'smart_toy',
    accentColor: 'bg-primary',
    datasets: [
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/llama31/bible' },
      { icon: 'local_florist', label: 'FLORES-200', path: '/llama31/flores' },
      { icon: 'science', label: 'Full Dataset', path: '/llama31/full-dataset' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/llama31/flores-table1' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/llama31/bible-table1' },
    ],
  },
  {
    modelName: 'Mistral 7B v0.3',
    modelIcon: 'smart_toy',
    accentColor: 'bg-tertiary',
    datasets: [
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/mistral/bible' },
      { icon: 'local_florist', label: 'FLORES-200', path: '/mistral/flores' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/mistral/flores-table1' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/mistral/bible-table1' },
    ],
  },
  {
    modelName: 'Qwen3 8B Base',
    modelIcon: 'smart_toy',
    accentColor: 'bg-secondary',
    datasets: [
      { icon: 'local_florist', label: 'FLORES-200', path: '/qwen3/flores' },
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/qwen3/bible' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/qwen3/flores-table1' },
      { icon: 'format_list_numbered', label: 'FLORES Table 1 (2k)', path: '/qwen3/flores-table1-2000' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/qwen3/bible-table1' },
    ],
  },
  {
    modelName: 'Qwen3.5 9B Base',
    modelIcon: 'smart_toy',
    accentColor: 'bg-secondary',
    datasets: [
      { icon: 'local_florist', label: 'FLORES-200', path: '/qwen3.5/flores' },
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/qwen3.5/bible' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/qwen3.5/flores-table1' },
      { icon: 'format_list_numbered', label: 'FLORES Table 1 (2k)', path: '/qwen3.5/flores-table1-2000' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/qwen3.5/bible-table1' },
    ],
  },
  {
    modelName: 'Qwen3 4B',
    modelIcon: 'smart_toy',
    accentColor: 'bg-secondary',
    datasets: [
      { icon: 'local_florist', label: 'FLORES-200', path: '/qwen3-4b/flores' },
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/qwen3-4b/bible' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/qwen3-4b/flores-table1' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/qwen3-4b/bible-table1' },
    ],
  },
  {
    modelName: 'Qwen3 1.7B',
    modelIcon: 'smart_toy',
    accentColor: 'bg-secondary',
    datasets: [
      { icon: 'local_florist', label: 'FLORES-200', path: '/qwen3-1.7b/flores' },
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/qwen3-1.7b/bible' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/qwen3-1.7b/flores-table1' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/qwen3-1.7b/bible-table1' },
    ],
  },
  {
    modelName: 'Qwen3 0.6B',
    modelIcon: 'smart_toy',
    accentColor: 'bg-secondary',
    datasets: [
      { icon: 'local_florist', label: 'FLORES-200', path: '/qwen3-0.6b/flores' },
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/qwen3-0.6b/bible' },
      { icon: 'table_chart', label: 'FLORES Table 1', path: '/qwen3-0.6b/flores-table1' },
      { icon: 'table_view', label: 'Bible Table 1', path: '/qwen3-0.6b/bible-table1' },
    ],
  },
  {
    modelName: 'Apertus 8B',
    modelIcon: 'smart_toy',
    accentColor: 'bg-error',
    datasets: [
      { icon: 'local_florist', label: 'FLORES-200', path: '/apertus/flores' },
      { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/apertus/bible' },
      { icon: 'format_list_numbered', label: 'FLORES Table 1 (2k)', path: '/apertus/flores-table1-2000' },
    ],
  },
];

/* ── Top-level nav items ── */
interface TopNavItem {
  icon: string;
  label: string;
  path: string;
}

const TOP_NAV: TopNavItem[] = [
  { icon: 'dashboard', label: 'Overview', path: '/' },
  { icon: 'menu_book', label: 'MEXA Findings', path: '/findings' },
];

const DATASET_NAV: TopNavItem[] = [
  { icon: 'local_florist', label: 'FLORES-200', path: '/datasets/flores' },
  { icon: 'auto_stories', label: 'Bible (sPBC)', path: '/datasets/bible' },
];

const BOTTOM_NAV: TopNavItem[] = [
  { icon: 'grid_view', label: 'Alignment', path: '/alignment' },
  { icon: 'analytics', label: 'Distribution', path: '/distribution' },
  { icon: 'compare_arrows', label: 'Comparison', path: '/comparison' },
  { icon: 'rule', label: 'Validation', path: '/validation' },
];

/* ── Collapsible Model Section ── */
function ModelSection({ group }: { group: ModelGroup }) {
  const location = useLocation();
  const isAnyChildActive = group.datasets.some(d => location.pathname === d.path);
  const [open, setOpen] = useState(isAnyChildActive);

  return (
    <div className="mb-1">
      {/* Model Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isAnyChildActive
            ? 'bg-surface-container-lowest text-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        }`}
      >
        {/* Accent dot */}
        <span className={`w-1.5 h-1.5 rounded-full ${group.accentColor} shrink-0`} />
        <span className="material-symbols-outlined text-lg">{group.modelIcon}</span>
        <span className="font-body text-sm font-semibold tracking-wide flex-1 text-left truncate">
          {group.modelName}
        </span>
        <span
          className={`material-symbols-outlined text-base transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dataset Sub-links */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ml-6 pl-3 border-l border-outline-variant/20 space-y-0.5 py-1">
          {group.datasets.map(ds => (
            <NavLink
              key={ds.path}
              to={ds.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-body tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high hover:translate-x-0.5'
                }`
              }
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontSize: '16px' }}
              >
                {ds.icon}
              </span>
              <span>{ds.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar ── */
export default function Sidebar() {
  return (
    <nav className="h-screen w-64 fixed left-0 bg-surface-container-low flex flex-col p-4 space-y-1 z-50 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-headline font-bold">
          M
        </div>
        <div>
          <h1 className="font-headline font-bold text-primary leading-tight">Thesis</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-secondary-container opacity-70">
            LLM Cross-lingual Evaluation
          </p>
        </div>
      </div>

      {/* Top nav */}
      <div className="space-y-1 mb-2">
        {TOP_NAV.map(item => (
          <NavLink
            key={item.path}
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
        ))}
      </div>

      {/* Datasets Section Label */}
      <div className="px-3 pt-4 pb-2">
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-on-surface-variant/50">
          Datasets
        </span>
      </div>
      <div className="space-y-1 mb-2">
        {DATASET_NAV.map(item => (
          <NavLink
            key={item.path}
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
        ))}
      </div>

      {/* Section Label */}
      <div className="px-3 pt-4 pb-2">
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-on-surface-variant/50">
          My Experiments
        </span>
      </div>

      {/* Model Groups */}
      <div className="space-y-0.5 flex-1">
        {MODEL_GROUPS.map(group => (
          <ModelSection key={group.modelName} group={group} />
        ))}
      </div>

      {/* Analysis Section Label */}
      <div className="px-3 pt-4 pb-2">
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-on-surface-variant/50">
          Analysis Tools
        </span>
      </div>

      {/* Bottom nav */}
      <div className="space-y-1 mb-4">
        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.path}
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
        ))}
      </div>

      {/* Footer links */}
      <div className="mt-auto pt-4 space-y-1 border-t border-outline-variant/10">
        {[
          { icon: 'history', label: 'Archive' },
          { icon: 'help_outline', label: 'Support' },
        ].map(link => (
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
