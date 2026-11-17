import { m } from 'framer-motion';
import { ArrowRight, Check, Clock, ShoppingCart } from 'lucide-react';
import { PRODUCT_MIX_IMAGE, WELCOME_COPY as C } from '../config/quiz';
import { PrimaryButton } from './PrimaryButton';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-fg/85">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]" aria-hidden="true" />
        {C.eyebrow}
      </p>

      {/* Headline cromada: "Abasteça sua loja / com a linha [Fixed] / da MZ3 Cosméticos" */}
      <h1 className="headline mt-5 text-center leading-[0.95]">
        <m.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-chrome block pb-1 text-[2.85rem] sm:text-[3.7rem]"
        >
          {C.headlineTop}
        </m.span>

        {/* Assinatura: COM A LINHA + plaqueta branca com o logotipo */}
        <m.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mt-2 flex items-center justify-center gap-3"
        >
          <span className="text-[1.75rem] text-fg sm:text-[2.1rem]">{C.signatureBefore}</span>
          <span className="-skew-x-[14deg] rounded-md bg-fg px-5 py-2 shadow-[0_10px_28px_-10px_rgba(50,215,255,0.55),inset_0_-2px_0_rgba(24,26,32,0.12)]">
            <img
              src="/brand/fixed-logo-graphite.webp"
              alt="Fixed"
              width={631}
              height={200}
              className="h-8 w-auto skew-x-[14deg] select-none sm:h-9"
              draggable={false}
            />
          </span>
        </m.span>

        <m.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="text-chrome mt-3 block pb-1 text-[2.3rem] sm:text-[3rem]"
        >
          {C.headlineBottom}
        </m.span>
      </h1>

      {/* Selo de oferta */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.42 }}
        className="mx-auto mt-5 flex items-center gap-3 rounded-full border border-cobalt/60 bg-navy px-5 py-2.5 shadow-[0_12px_30px_-12px_rgba(0,101,255,0.7),inset_0_1px_0_rgba(50,215,255,0.18)]"
      >
        <ShoppingCart className="h-6 w-6 shrink-0 text-fg" strokeWidth={2.2} aria-hidden="true" />
        <span className="h-8 w-px bg-fg/30" aria-hidden="true" />
        <span className="flex flex-col leading-none">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-fg/80">{C.offerLabel}</span>
          <span className="mt-1 text-[1.45rem] font-extrabold tracking-tight text-fg">{C.offerValue}</span>
        </span>
      </m.div>

      {PRODUCT_MIX_IMAGE && (
        <img
          src={PRODUCT_MIX_IMAGE}
          alt="Mix de produtos Fixed"
          decoding="async"
          className="mx-auto mt-6 h-auto w-full max-w-[420px] select-none drop-shadow-[0_24px_30px_rgba(0,0,0,0.6)]"
          draggable={false}
        />
      )}

      <p className="mt-6 text-center text-[15px] font-medium leading-relaxed text-fg/70 sm:text-base">{C.subheadline}</p>

      <ul className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        {C.benefits.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] font-semibold text-fg">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cobalt/25 text-cyan">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA fixo no rodapé no mobile para estar sempre ao alcance do polegar */}
      <div className="sticky bottom-0 -mx-5 mt-6 rounded-b-[24px] bg-gradient-to-t from-surface via-surface/95 to-transparent px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0 sm:pt-2">
        <PrimaryButton type="button" onClick={onStart}>
          {C.cta}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-fg/55">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {C.microcopy}
        </p>
      </div>
    </div>
  );
}
