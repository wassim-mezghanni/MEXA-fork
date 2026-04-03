

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs({
  tabs,
  activeTabId,
  onChange,
  variant = 'underline',
  className = ''
}: TabsProps) {
  const containerStyles = variant === 'pill' 
    ? "flex p-1 bg-surface-container-low rounded-xl gap-1"
    : "flex border-b border-outline-variant/30 w-full mb-8";

  const getTabStyles = (isActive: boolean) => {
    if (variant === 'pill') {
      return `flex-1 py-2 px-4 rounded-lg font-heading font-bold text-sm transition-all duration-300 select-none
        ${isActive ? 'bg-white shadow-sm text-primary -translate-y-0.5' : 'text-on-surface-variant hover:text-primary'}
      `;
    } else {
      return `px-6 py-3 font-heading font-bold text-sm tracking-tight transition-all relative select-none
        ${isActive 
          ? 'text-primary after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
          : 'text-on-surface-variant hover:text-primary'}
      `;
    }
  };

  return (
    <div className={`${containerStyles} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={getTabStyles(activeTabId === tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
