import { ArrowRight, FileText, Loader2, Lock, MapPin, Phone, User } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { CONTACT_COPY as C } from '../config/quiz';
import { maskCnpj, maskPhone, validateCnpj, validateFullName, validatePhone } from '../lib/validation';
import type { ContactData } from '../types';
import { FormField } from './FormField';
import { PrimaryButton } from './PrimaryButton';
import { StepHeading } from './StepHeading';
import { WhatsAppIcon } from './WhatsAppButton';

type FieldKey = 'name' | 'whatsapp' | 'cnpj';
const ORDER: FieldKey[] = ['name', 'whatsapp', 'cnpj'];

interface ContactFormProps {
  value: ContactData;
  cityUf: string;
  /** CNPJ é obrigatório para quem tem loja; opcional para "Ainda não tenho loja". */
  cnpjRequired: boolean;
  sending: boolean;
  submitFailed: boolean;
  /** Link direto para o consultor, oferecido se o CRM não confirmar o envio. */
  whatsappUrl: string;
  onWhatsAppClick: () => void;
  onChange: (patch: Partial<ContactData>) => void;
  onSubmit: () => void;
  onEditLocation: () => void;
}

export function ContactForm({
  value,
  cityUf,
  cnpjRequired,
  sending,
  submitFailed,
  whatsappUrl,
  onWhatsAppClick,
  onChange,
  onSubmit,
  onEditLocation,
}: ContactFormProps) {
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    whatsapp: useRef<HTMLInputElement>(null),
    cnpj: useRef<HTMLInputElement>(null),
  };

  const errors: Record<FieldKey, string | null> = {
    name: validateFullName(value.name),
    whatsapp: validatePhone(value.whatsapp),
    cnpj: validateCnpj(value.cnpj, cnpjRequired),
  };
  const shown = (k: FieldKey) => ((submitted || touched[k]) && errors[k]) || null;
  const touch = (k: FieldKey) => () => setTouched((t) => ({ ...t, [k]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sending) return; // evita envio duplicado
    setSubmitted(true);
    const firstInvalid = ORDER.find((k) => errors[k]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col" aria-busy={sending}>
      <StepHeading title={C.title} subtitle={C.subtitle} />

      {cityUf && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-fg/80">
            <MapPin className="h-4 w-4 text-cyan" aria-hidden="true" />
            <span>
              <span className="text-fg/50">Cidade/UF: </span>
              <strong className="font-bold text-fg">{cityUf}</strong>
            </span>
          </span>
          <button
            type="button"
            onClick={onEditLocation}
            className="focus-ring rounded-md px-1 text-xs font-bold text-cyan underline-offset-2 hover:underline"
          >
            Alterar
          </button>
        </div>
      )}

      <fieldset disabled={sending} className="mt-6 flex flex-col gap-4">
        <legend className="sr-only">Seus dados de contato</legend>
        <FormField
          ref={refs.name}
          label={C.fields.name.label}
          placeholder={C.fields.name.placeholder}
          icon={User}
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={120}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={touch('name')}
          error={shown('name')}
          valid={!errors.name}
          required
        />
        <FormField
          ref={refs.whatsapp}
          label={C.fields.whatsapp.label}
          placeholder={C.fields.whatsapp.placeholder}
          icon={Phone}
          name="tel"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value.whatsapp}
          onChange={(e) => onChange({ whatsapp: maskPhone(e.target.value) })}
          onBlur={touch('whatsapp')}
          error={shown('whatsapp')}
          valid={!errors.whatsapp}
          required
        />
        <FormField
          ref={refs.cnpj}
          label={C.fields.cnpj.label}
          hint={cnpjRequired ? undefined : C.fields.cnpj.optionalHint}
          placeholder={C.fields.cnpj.placeholder}
          icon={FileText}
          name="cnpj"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={value.cnpj}
          onChange={(e) => onChange({ cnpj: maskCnpj(e.target.value) })}
          onBlur={touch('cnpj')}
          error={shown('cnpj')}
          valid={!!value.cnpj && !errors.cnpj}
          required={cnpjRequired}
        />
      </fieldset>

      <div className="mt-6">
        {submitFailed && (
          <div role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
            <p className="font-semibold">Não conseguimos confirmar seu cadastro.</p>
            <p className="mt-1 text-red-200/80">
              Seus dados foram mantidos. Tente enviar novamente ou{' '}
              <a
                href={whatsappUrl}
                onClick={onWhatsAppClick}
                className="focus-ring inline-flex items-center gap-1 rounded font-bold text-fg underline underline-offset-2"
              >
                <WhatsAppIcon className="h-4 w-4" />
                fale direto com o consultor
              </a>
              .
            </p>
          </div>
        )}
        <PrimaryButton type="submit" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              {C.sending}
            </>
          ) : (
            <>
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              {C.cta}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </PrimaryButton>
        <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-xs font-medium leading-relaxed text-fg/50">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {C.consent}
        </p>
      </div>
    </form>
  );
}
