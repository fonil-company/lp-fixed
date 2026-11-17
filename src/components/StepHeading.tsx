import { useEffect, useRef } from 'react';

interface StepHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

/** Título de etapa. Recebe o foco ao montar, para leitores de tela anunciarem a nova pergunta. */
export function StepHeading({ title, subtitle, align = 'left' }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <h1 ref={ref} tabIndex={-1} className="headline text-[2.15rem] text-fg outline-none sm:text-[2.6rem]">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-[15px] font-medium leading-relaxed text-fg/65 sm:text-base">{subtitle}</p>}
    </div>
  );
}
