import React from 'react';

export interface ModelScore {
  model: string;
  score: number;
}

export interface LanguageCardProps {
  /** ISO code e.g. "hin_Deva" */
  code: string;
  /** Human-readable name e.g. "Hindi" */
  name: string;
  /** Language family e.g. "Indo-European" */
  family?: string;
  /** Script system e.g. "Devanagari" */
  script?: string;
  /** Resource level */
  resourceLevel?: 'high' | 'medium' | 'low';
  /** Per-model scores */
  scores?: ModelScore[];
  /** Overall average score */
  avgScore?: number;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

const RESOURCE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  high: { label: 'High', bg: 'bg-primary/10', text: 'text-primary' },
  medium: { label: 'Medium', bg: 'bg-surface-tint/10', text: 'text-surface-tint' },
  low: { label: 'Low', bg: 'bg-error/10', text: 'text-error' },
};

export const LanguageCard: React.FC<LanguageCardProps> = ({
  code,
  name,
  family,
  script,
  resourceLevel,
  scores = [],
  avgScore,
  onClick,
  className = '',
}) => {
  const badge = resourceLevel ? RESOURCE_BADGES[resourceLevel] : null;

  // Find best score for the mini bar chart
  const maxScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 1;

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-5 hover:shadow-[0_10px_30px_-5px_rgba(25,28,29,0.08)] transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Top row: name + badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-headline font-bold text-on-surface text-sm leading-tight">{name}</h4>
          <span className="font-mono text-[10px] text-on-surface-variant">{code}</span>
        </div>
        {badge && (
          <span
            className={`${badge.bg} ${badge.text} text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Meta row: family + script */}
      {(family || script) && (
        <div className="flex items-center gap-3 mb-4">
          {family && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                account_tree
              </span>
              <span className="text-[11px] text-on-surface-variant">{family}</span>
            </div>
          )}
          {script && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                translate
              </span>
              <span className="text-[11px] text-on-surface-variant">{script}</span>
            </div>
          )}
        </div>
      )}

      {/* Score bars */}
      {scores.length > 0 && (
        <div className="space-y-2 mb-3">
          {scores.map((s) => (
            <div key={s.model} className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant w-20 truncate font-medium">
                {s.model}
              </span>
              <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(s.score / maxScore) * 100}%`,
                    backgroundColor:
                      s.score >= 0.7 ? '#004655' : s.score >= 0.4 ? '#13677b' : '#ba1a1a',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-on-surface w-10 text-right">
                {s.score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Average score footer */}
      {avgScore !== undefined && (
        <div className="pt-3 border-t border-outline-variant/15 flex justify-between items-center">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
            Avg Score
          </span>
          <span className="text-lg font-headline font-extrabold text-primary">
            {avgScore.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LanguageCard;
