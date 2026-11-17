import { m, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

/** Cápsula azul-cobalto com texto branco, como o CTA do criativo. */
const base =
  'focus-ring relative inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-full bg-cobalt-gloss px-6 py-4 font-sans text-[15px] font-extrabold uppercase tracking-wide text-fg shadow-[0_14px_34px_-10px_rgba(0,101,255,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_18px_44px_-10px_rgba(0,101,255,0.95),inset_0_1px_0_rgba(255,255,255,0.35)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode };

export function PrimaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <m.button whileTap={{ scale: 0.98 }} className={`${base} ${className}`} {...props}>
      {children}
    </m.button>
  );
}

type LinkProps = Omit<HTMLMotionProps<'a'>, 'children'> & { children: ReactNode };

export function PrimaryLink({ children, className = '', ...props }: LinkProps) {
  return (
    <m.a whileTap={{ scale: 0.98 }} className={`${base} ${className}`} {...props}>
      {children}
    </m.a>
  );
}
