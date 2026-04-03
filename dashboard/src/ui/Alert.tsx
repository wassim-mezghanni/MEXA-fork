

export interface AlertProps {
  variant?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  icon?: string;
  className?: string;
}

export function Alert({
  variant = 'success',
  title,
  message,
  icon,
  className = ''
}: AlertProps) {
  const configs = {
    success: {
      container: "bg-emerald-50 text-emerald-950 border-emerald-100",
      iconBg: "bg-white text-emerald-600",
      defaultIcon: "check_circle"
    },
    error: {
      container: "bg-red-50 text-red-950 border-red-100",
      iconBg: "bg-white text-red-600",
      defaultIcon: "warning"
    },
    info: {
      container: "bg-blue-50 text-blue-950 border-blue-100",
      iconBg: "bg-white text-blue-600",
      defaultIcon: "info"
    },
    warning: {
      container: "bg-amber-50 text-amber-950 border-amber-100",
      iconBg: "bg-white text-amber-600",
      defaultIcon: "report_problem"
    }
  };

  const config = configs[variant];

  return (
    <div className={`flex items-center gap-6 p-6 rounded-xl border transition-all duration-300 ${config.container} ${className}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0 ${config.iconBg}`}>
        <span className="icon text-[24px]">
          {icon || config.defaultIcon}
        </span>
      </div>
      <div className="space-y-1">
        <p className="font-bold font-heading text-lg leading-tight uppercase tracking-tight">{title}</p>
        <p className="text-sm opacity-80 leading-relaxed max-w-lg">{message}</p>
      </div>
    </div>
  );
}
