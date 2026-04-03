import React from 'react';

export type ExperimentStatus = 'completed' | 'running' | 'failed' | 'queued';

export interface ExperimentEntry {
  id: string;
  title: string;
  /** ISO timestamp or display string */
  timestamp: string;
  status: ExperimentStatus;
  /** e.g. "Llama 3.1 8B" */
  model?: string;
  /** e.g. "FLORES-200" */
  dataset?: string;
  /** Optional score if completed */
  score?: number;
  /** Duration string e.g. "2h 14m" */
  duration?: string;
}

export interface ExperimentTimelineProps {
  title?: string;
  entries: ExperimentEntry[];
  /** Max visible entries before "Show more" */
  maxVisible?: number;
  onEntryClick?: (entry: ExperimentEntry) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  ExperimentStatus,
  { icon: string; iconFill: boolean; dotColor: string; label: string; textColor: string }
> = {
  completed: {
    icon: 'check_circle',
    iconFill: true,
    dotColor: 'bg-primary',
    label: 'Completed',
    textColor: 'text-primary',
  },
  running: {
    icon: 'pending',
    iconFill: false,
    dotColor: 'bg-surface-tint',
    label: 'Running',
    textColor: 'text-surface-tint',
  },
  failed: {
    icon: 'error',
    iconFill: true,
    dotColor: 'bg-error',
    label: 'Failed',
    textColor: 'text-error',
  },
  queued: {
    icon: 'schedule',
    iconFill: false,
    dotColor: 'bg-outline',
    label: 'Queued',
    textColor: 'text-outline',
  },
};

export const ExperimentTimeline: React.FC<ExperimentTimelineProps> = ({
  title = 'Experiment Log',
  entries,
  maxVisible = 5,
  onEntryClick,
  className = '',
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const visible = expanded ? entries : entries.slice(0, maxVisible);
  const hasMore = entries.length > maxVisible;

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-8 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          {entries.length} runs
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-outline-variant/30" />

        <div className="space-y-0">
          {visible.map((entry, i) => {
            const cfg = STATUS_CONFIG[entry.status];
            const isLast = i === visible.length - 1;

            return (
              <div
                key={entry.id}
                className={`relative flex gap-4 pb-6 ${
                  onEntryClick ? 'cursor-pointer hover:bg-surface-container-low/50 -mx-3 px-3 rounded-lg transition-colors' : ''
                }`}
                onClick={() => onEntryClick?.(entry)}
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 mt-0.5">
                  <span
                    className={`material-symbols-outlined text-lg ${cfg.textColor}`}
                    style={{
                      fontVariationSettings: cfg.iconFill ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {cfg.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-on-surface leading-tight">
                        {entry.title}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {entry.timestamp}
                        {entry.duration && (
                          <span className="ml-2 text-on-surface-variant/70">
                            · {entry.duration}
                          </span>
                        )}
                      </p>
                    </div>
                    {entry.score !== undefined && (
                      <span className="text-sm font-headline font-extrabold text-primary tabular-nums">
                        {entry.score.toFixed(3)}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {(entry.model || entry.dataset) && (
                    <div className="flex items-center gap-2 mt-2">
                      {entry.model && (
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-secondary-container/50 text-on-secondary-container px-2 py-0.5 rounded">
                          {entry.model}
                        </span>
                      )}
                      {entry.dataset && (
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded">
                          {entry.dataset}
                        </span>
                      )}
                      <span
                        className={`text-[9px] uppercase tracking-widest font-bold ${cfg.textColor}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 pt-4 border-t border-outline-variant/15 flex items-center justify-center gap-2 text-xs font-bold text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
          {expanded ? 'Show less' : `Show ${entries.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
};

export default ExperimentTimeline;
