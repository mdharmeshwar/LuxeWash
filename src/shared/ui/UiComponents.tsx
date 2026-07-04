import * as React from "react";
import { LucideIcon } from "lucide-react";

// --- TOAST SYSTEM STATE ---
export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  description?: string;
}

// --- BUTTONS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";
    
    const variants = {
      primary: "bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.25)] hover:bg-red-700 hover:shadow-[0_4px_18px_rgba(220,38,38,0.4)] border border-red-500/25",
      secondary: "bg-neutral-900 text-neutral-200 border border-neutral-800 hover:border-red-600/40 hover:text-white hover:bg-red-600/5 hover:shadow-[0_0_12px_rgba(220,38,38,0.1)]",
      danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.35)]",
      ghost: "text-neutral-400 hover:text-white hover:bg-neutral-900/80",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-7 py-3.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
        {children}
        {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- INPUTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon: Icon, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined;
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`w-full bg-neutral-900 border text-sm rounded-lg py-2.5 transition-all duration-200 outline-none
              ${Icon ? "pl-10" : "pl-4.5"} pr-4
              ${error 
                ? "border-red-500 text-red-100 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" 
                : "border-neutral-800 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600/20"
              }
              placeholder-neutral-600 disabled:opacity-50 disabled:bg-neutral-950`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-neutral-500">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

// --- SELECT MENUS ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || React.useId();
    const describedBy = error ? `${selectId}-error` : helperText ? `${selectId}-hint` : undefined;
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full bg-neutral-900 border text-sm rounded-lg px-4 py-2.5 transition-all duration-200 outline-none appearance-none
            ${error 
              ? "border-red-500 text-red-100 focus:border-red-500" 
              : "border-neutral-800 text-white focus:border-red-600"
            }
            disabled:opacity-50 disabled:bg-neutral-950`}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px'
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-neutral-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-neutral-500">{helperText}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

// --- CARDS ---
interface CardProps {
  children?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
  key?: React.Key;
}

export const Card = ({ className = "", children, hoverEffect = false, glow = false, ...props }: CardProps) => {
  return (
    <div
      className={`bg-[#0c0d12]/95 backdrop-blur-xl border border-neutral-900 rounded-xl p-6 transition-all duration-300 relative overflow-hidden
        ${hoverEffect ? "hover:-translate-y-1.5 hover:border-red-600/30 hover:bg-[#0c0d12] hover:shadow-[0_15px_30px_-10px_rgba(220,38,38,0.15)]" : ""}
        ${glow ? "shadow-[0_0_30px_rgba(220,38,38,0.06)] border-red-600/20" : ""}
        ${className}`}
      {...props}
    >
      {/* Absolute card background texture line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/25 to-transparent" />
      {children}
    </div>
  );
};

// --- TABLES ---
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
}

export const Table: React.FC<TableProps> = ({ headers, children, className = "", ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/40">
      <table className={`w-full text-left border-collapse text-sm text-neutral-300 ${className}`} {...props}>
        <thead className="sticky top-0 z-10 bg-neutral-900/85 backdrop-blur text-xs font-semibold text-neutral-400 tracking-wider uppercase border-b border-neutral-800">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-5 py-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// --- MODALS ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Content Container */}
      <div 
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-800 flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-1.5 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh] text-neutral-300 text-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-neutral-950/50 border-t border-neutral-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- TOAST CONTAINER & ITEM ---
export const ToastMessage: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const bgStyles = {
    success: "border-emerald-500/20 bg-emerald-950/20",
    error: "border-red-500/20 bg-red-950/20",
    info: "border-sky-500/20 bg-sky-950/20"
  };

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-xl shadow-xl backdrop-blur-md max-w-sm w-full animate-in slide-in-from-right duration-250 ${bgStyles[toast.type]}`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{toast.message}</p>
        {toast.description && <p className="text-xs text-neutral-400 mt-1 leading-normal">{toast.description}</p>}
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-neutral-400 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// --- TABS ---
interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div className={`flex border-b border-neutral-850 gap-2 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold tracking-wide border-b-2 transition-all shrink-0 whitespace-nowrap
              ${isActive 
                ? "border-red-600 text-red-500" 
                : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-800"
              }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

// --- PAGINATION ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between py-4 px-5 bg-neutral-950/20 border-t border-neutral-800/60 text-sm">
      <div className="text-neutral-400 text-xs font-medium">
        Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// --- BADGES ---
interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", children }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    info: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    neutral: "bg-neutral-800 text-neutral-300 border border-neutral-700"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase leading-tight ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- EMPTY STATES ---
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/15">
      {Icon && (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-500 mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-normal">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

// --- OPTIMIZED AUTOMOTIVE HUD CAR IMAGE ---
interface OptimizedCarImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export const OptimizedCarImage: React.FC<OptimizedCarImageProps> = ({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  aspectRatio = "aspect-video"
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Enhance Unsplash URLs automatically with low-bandwidth, fast-loading, high-quality parameters
  const optimizedUrl = React.useMemo(() => {
    if (src.includes("unsplash.com")) {
      // Strip any existing width/quality params and append highly compressed ones
      const baseUrl = src.split("?")[0];
      return `${baseUrl}?auto=format&fit=crop&w=650&q=65`;
    }
    return src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-950 border border-slate-900/80 rounded-xl group/img ${aspectRatio}`}>
      {/* Carbon fiber grid skeleton placeholder */}
      <div 
        className={`absolute inset-0 carbon-grid flex flex-col items-center justify-center transition-all duration-700 z-10
          ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* Animated laser HUD scanner */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-[scan_2.5s_infinite_ease-in-out]" />
        
        <div className="flex flex-col items-center gap-2">
          {/* Pulsating car wireframe outline (using customized SVG outline) */}
          <svg className="w-12 h-12 text-slate-800/80 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.3 2 11.6V16c0 .6.4 1 1 1h2m10 0a3 3 0 11-6 0m6 0a3 3 0 11-6 0m6 0H9m10 0h-2" />
          </svg>
          <span className="text-[9px] font-mono tracking-widest text-red-500 uppercase animate-pulse">Pre-loading Laser SCAN...</span>
        </div>
      </div>

      {/* Actual Image */}
      {!hasError ? (
        <img
          src={optimizedUrl}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} transition-all duration-700 ease-out transform group-hover/img:scale-[1.04]
            ${isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"}`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 border border-slate-850">
          <span className="text-xs font-mono text-neutral-500">Image Load Interrupted</span>
        </div>
      )}

      {/* Cybernetic telemetry display borders */}
      <div className="absolute inset-0 border border-red-500/0 group-hover/img:border-red-500/25 transition-all duration-300 pointer-events-none rounded-xl" />
      
      {/* Sci-fi targeting box lines in corner */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-red-500/0 group-hover/img:border-red-500/60 transition-all duration-500 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-red-500/0 group-hover/img:border-red-500/60 transition-all duration-500 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-red-500/0 group-hover/img:border-red-500/60 transition-all duration-500 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-red-500/0 group-hover/img:border-red-500/60 transition-all duration-500 pointer-events-none" />
    </div>
  );
};

// --- LOADING SKELETONS ---
export const LoadingSkeleton: React.FC<{ type?: "table" | "cards" | "form" }> = ({ type = "cards" }) => {
  if (type === "table") {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-850" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-neutral-900/60 rounded-lg border border-neutral-850/60" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-neutral-850 w-20 rounded" />
              <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-850" />
            </div>
          ))}
        </div>
        <div className="h-12 bg-neutral-900 w-36 rounded-lg ml-auto" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-neutral-800 w-24 rounded" />
            <div className="h-5 bg-neutral-800 w-16 rounded-full" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-neutral-800 w-full rounded" />
            <div className="h-3 bg-neutral-800 w-2/3 rounded" />
          </div>
          <div className="flex gap-2 pt-4 border-t border-neutral-850">
            <div className="h-8 bg-neutral-800 w-full rounded-lg" />
            <div className="h-8 bg-neutral-800 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
