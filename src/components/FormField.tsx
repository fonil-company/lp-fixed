import { AlertCircle, type LucideIcon } from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';
import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string | null;
  valid?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, icon: Icon, hint, error, valid, className = '', ...props },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between font-sans text-sm font-semibold text-fg">
        {label}
        {hint && <span className="font-sans text-xs font-medium text-fg/50">{hint}</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
              error ? 'text-red-400' : valid ? 'text-cyan' : 'text-fg/40'
            }`}
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`h-14 w-full rounded-xl border bg-white/[0.05] font-medium text-fg placeholder:font-normal placeholder:text-fg/35 transition-[border-color,background-color,box-shadow] duration-200 focus:bg-white/[0.08] focus:outline-none ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 ${
            error
              ? 'border-red-400/70 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.22)]'
              : 'border-white/12 hover:border-cyan/35 focus:border-cobalt focus:shadow-[0_0_0_3px_rgba(0,101,255,0.3)]'
          }`}
          {...props}
        />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <m.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-[13px] font-medium text-red-300"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
});
