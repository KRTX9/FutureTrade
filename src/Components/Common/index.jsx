import clsx from "clsx";

/**
 * Loading spinner component
 */
export function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-2 border-gray-600 border-t-yellow-500",
        sizes[size],
        className,
      )}
    />
  );
}

/**
 * Loading skeleton for content placeholders
 */
export function Skeleton({ className, variant = "text" }) {
  const baseClass = "animate-pulse bg-gray-700 rounded";

  const variants = {
    text: "h-4 w-full",
    heading: "h-6 w-3/4",
    avatar: "h-10 w-10 rounded-full",
    chart: "h-64 w-full",
    card: "h-32 w-full",
  };

  return <div className={clsx(baseClass, variants[variant], className)} />;
}

/**
 * Button component with variants
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  const variants = {
    primary: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-gray-700 text-gray-300",
    outline:
      "border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(
        "rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

/**
 * Card component for content containers
 */
export function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        "bg-[#181a20] border border-gray-800 rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx("px-4 py-3 border-b border-gray-800", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={clsx("p-4", className)}>{children}</div>;
}

/**
 * Input component
 */
export function Input({
  label,
  error,
  suffix,
  prefix,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-400 mb-1">{label}</label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          className={clsx(
            "w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors",
            prefix && "pl-8",
            suffix && "pr-16",
            error && "border-red-500",
            inputClassName,
          )}
          {...props}
          value={props.value ?? ""}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Select component
 */
export function Select({ label, options = [], error, className, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-400 mb-1">{label}</label>
      )}
      <select
        className={clsx(
          "w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors",
          error && "border-red-500",
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Tabs component
 */
export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={clsx("flex border-b border-gray-800", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={clsx(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            activeTab === tab.id
              ? "text-yellow-500"
              : "text-gray-400 hover:text-white",
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-gray-500">({tab.count})</span>
          )}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Badge component
 */
export function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-gray-700 text-gray-300",
    success: "bg-green-500/20 text-green-400",
    danger: "bg-red-500/20 text-red-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    info: "bg-blue-500/20 text-blue-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Toggle/Switch component
 */
export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={clsx(
            "w-10 h-5 rounded-full transition-colors",
            checked ? "bg-yellow-500" : "bg-gray-600",
            disabled && "opacity-50",
          )}
        />
        <div
          className={clsx(
            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
}

/**
 * Color utility for PnL
 */
export function PnLText({ value, showSign = true, className }) {
  const numValue = parseFloat(value);
  const isPositive = numValue > 0;
  const isNegative = numValue < 0;

  return (
    <span
      className={clsx(
        isPositive && "text-green-500",
        isNegative && "text-red-500",
        !isPositive && !isNegative && "text-gray-400",
        className,
      )}
    >
      {showSign && isPositive && "+"}
      {typeof value === "number" ? value.toFixed(2) : value}
    </span>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-12 h-12 text-gray-600 mb-4" />}
      <h3 className="text-lg font-medium text-gray-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
