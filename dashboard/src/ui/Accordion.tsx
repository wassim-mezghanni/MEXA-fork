import { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  icon?: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenIds?: string[];
  multiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  defaultOpenIds = [],
  multiple = false,
  className = '',
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(defaultOpenIds)
  );

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className="rounded-xl bg-surface-container-lowest overflow-hidden"
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-container-low/50 transition-colors"
            >
              {item.icon && (
                <span className="icon text-xl text-primary/70">{item.icon}</span>
              )}
              <span className="flex-1 font-headline font-bold text-sm text-on-surface">
                {item.title}
              </span>
              <span className={`icon text-lg text-outline/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-1">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
