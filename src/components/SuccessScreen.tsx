import { m } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { REDIRECT_DELAY_MS, SUCCESS_COPY as C } from '../config/quiz';
import { StepHeading } from './StepHeading';
import { WhatsAppButton, WhatsAppIcon } from './WhatsAppButton';

interface SuccessScreenProps {
  /** true logo após o envio do formulário: abre o WhatsApp sozinho. false quando a pessoa volta à página. */
  autoRedirect: boolean;
  whatsappUrl: string;
  summary: { label: string; value: string }[];
  onWhatsAppClick: () => void;
}

export function SuccessScreen({ autoRedirect, whatsappUrl, summary, onWhatsAppClick }: SuccessScreenProps) {
  const done = useRef(false);
  const onClickRef = useRef(onWhatsAppClick);
  onClickRef.current = onWhatsAppClick;

  useEffect(() => {
    if (!autoRedirect) return;
    const t = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onClickRef.current();
      // Navegação na mesma aba: não é barrada por bloqueador de pop-up e abre o app no celular.
      window.location.assign(whatsappUrl);
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [autoRedirect, whatsappUrl]);

  const size = 88;
  const r = 40;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <m.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative mb-6 grid place-items-center"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          {autoRedirect && (
            <m.circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="url(#fx-ring)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: REDIRECT_DELAY_MS / 1000, ease: 'linear' }}
            />
          )}
          <defs>
            <linearGradient id="fx-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0065FF" />
              <stop offset="1" stopColor="#32D7FF" />
            </linearGradient>
          </defs>
        </svg>
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-cobalt-gloss shadow-[0_10px_30px_-8px_rgba(0,101,255,0.9)]">
          <WhatsAppIcon className="h-7 w-7 text-fg" />
        </span>
      </m.div>

      <StepHeading
        title={autoRedirect ? C.title : 'Seu consultor está esperando'}
        subtitle={autoRedirect ? C.subtitleRedirect : C.subtitleReturn}
        align="center"
      />

      <div className="mt-8 w-full">
        <WhatsAppButton
          href={whatsappUrl}
          label={C.cta}
          onClick={() => {
            done.current = true;
            onWhatsAppClick();
          }}
        />
      </div>

      <details className="group mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.035]">
        <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-fg/80 [&::-webkit-details-marker]:hidden">
          Resumo das suas respostas
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <dl className="grid gap-x-4 gap-y-2.5 border-t border-white/10 px-4 py-4 text-sm sm:grid-cols-[auto_1fr]">
          {summary.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-fg/50">{row.label}</dt>
              <dd className="-mt-2 font-semibold text-fg sm:mt-0">{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
