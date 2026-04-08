"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 4000;
let _counter = 0;
const nextId = () => `toast-${++_counter}`;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId();
      setToasts((prev) => [...prev, { ...options, id }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Portal-style container — always on top */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[300] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard item={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}

// ─── Toast card ───────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<
  ToastType,
  { wrapper: string; icon: React.ElementType; iconClass: string }
> = {
  success: {
    wrapper:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 shadow-emerald-900/15 dark:bg-[oklch(0.11_0.025_160)] dark:text-emerald-100 dark:shadow-emerald-900/40",
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
  },
  error: {
    wrapper:
      "border-red-500/30 bg-red-500/10 text-red-700 shadow-red-900/15 dark:bg-[oklch(0.11_0.025_25)] dark:text-red-100 dark:shadow-red-900/40",
    icon: AlertCircle,
    iconClass: "text-red-400",
  },
  info: {
    wrapper:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 shadow-blue-900/15 dark:bg-[oklch(0.11_0.025_250)] dark:text-blue-100 dark:shadow-blue-900/40",
    icon: Info,
    iconClass: "text-blue-400",
  },
};

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const { wrapper, icon: Icon, iconClass } = TOAST_STYLES[item.type];

  return (
    <div
      className={`flex min-w-72 max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md ${wrapper}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-xs opacity-65 leading-snug">
            {item.description}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-1 mt-0.5 shrink-0 opacity-40 transition-opacity hover:opacity-80"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
