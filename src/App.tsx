import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, type Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContactForm } from './components/ContactForm';
import { DevNotice } from './components/DevNotice';
import { LocationStep } from './components/LocationStep';
import { QuestionCard } from './components/QuestionCard';
import { QuizLayout } from './components/QuizLayout';
import { SuccessScreen } from './components/SuccessScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QUESTIONS, TOTAL_QUESTIONS, type ChoiceQuestionId } from './config/quiz';
import { cityUf, optionLabel } from './lib/answers';
import { submitLead } from './lib/crm';
import type { CapiUser } from './lib/capi';
import { buildLeadPayload, leadSignature, type LeadPayload } from './lib/lead';
import { initPixel, trackPageView, trackPixel } from './lib/pixel';
import { qualifyLead } from './lib/qualification';
import { maskCnpj, maskPhone } from './lib/validation';
import { buildWhatsAppMessage, buildWhatsAppUrl, whatsAppNumberFor } from './lib/whatsapp';
import { QuizProvider, useQuiz } from './state/QuizContext';

const CONTENT_NAME = 'Quiz Lojistas Fixed';

/** Dados do lead para a API de Conversões (com hash em capi.ts). */
const capiUser = (p: LeadPayload): CapiUser => ({
  phone: p.contact.whatsapp,
  name: p.contact.name,
  city: p.location.city,
  state: p.location.uf,
  externalId: p.lead_id,
});

const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
};

function QuizFlow() {
  const { state, step, dispatch, next, back, goToStep } = useQuiz();
  const submitting = useRef(false);
  /** Liga o redirecionamento automático só logo após o envio (não ao voltar do WhatsApp). */
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    initPixel();
    trackPageView({ externalId: state.leadId });
  }, []);

  useEffect(() => {
    if (step === 'establishment') {
      trackPixel(
        'ViewContent',
        { content_name: CONTENT_NAME, content_category: 'Qualificação B2B' },
        { user: { externalId: state.leadId } },
      );
    }
    window.scrollTo({ top: 0 });
  }, [step]);

  const qualification = useMemo(() => qualifyLead(state.answers, state.location), [state.answers, state.location]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(buildWhatsAppMessage(state), whatsAppNumberFor(state.location.uf)),
    [state],
  );

  const handleContactSubmit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const payload = buildLeadPayload(state);
      const signature = leadSignature(payload);

      // Reenvia só aos destinos que ainda não confirmaram estes mesmos dados
      // (ex.: voltou e avançou sem editar, ou o CRM falhou na primeira tentativa).
      const targets = {
        state: state.submission.stateSignature !== signature,
        crm: state.submission.crmSignature !== signature,
      };
      if (!targets.state && !targets.crm) {
        setAutoRedirect(true);
        next();
        return;
      }

      dispatch({ type: 'SUBMIT_START' });
      const result = await submitLead(payload, targets);
      const crmConfirmed = result.crmOk || !targets.crm;
      dispatch({
        type: 'SUBMIT_DONE',
        status: crmConfirmed ? 'ok' : 'failed',
        signature,
        stateOk: result.stateOk,
        crmOk: result.crmOk,
      });

      // Lead só quando o CRM confirmou o recebimento (HTTP 2xx) — nunca por outro destino.
      if (result.crmOk) {
        trackPixel(
          'Lead',
          { content_name: CONTENT_NAME, lead_quality: payload.qualification.priority },
          { onceKey: `Lead:${state.leadId}`, eventID: state.leadId, user: capiUser(payload) },
        );
      }
      if (crmConfirmed) {
        setAutoRedirect(true);
        next();
      }
    } finally {
      submitting.current = false;
    }
  };

  const handleWhatsAppClick = useCallback(() => {
    trackPixel(
      'Contact',
      { content_name: CONTENT_NAME },
      { onceKey: `Contact:${state.leadId}`, eventID: `Contact.${state.leadId}`, user: capiUser(buildLeadPayload(state)) },
    );
  }, [state]);

  const summary = useMemo(() => {
    const rows = [
      { label: 'Nome', value: state.contact.name.trim() },
      { label: 'Telefone', value: maskPhone(state.contact.whatsapp) },
      { label: 'CNPJ', value: maskCnpj(state.contact.cnpj) },
      { label: 'Cidade/UF', value: cityUf(state.location) },
    ];
    (['establishment', 'resale', 'budget', 'relationship', 'timing'] as ChoiceQuestionId[]).forEach((id) =>
      rows.push({ label: QUESTIONS[id].summaryLabel, value: optionLabel(id, state.answers[id]) }),
    );
    return rows;
  }, [state.contact, state.location, state.answers]);

  // Perguntas 1–6 ocupam os índices 1..6; o formulário é a etapa final antes do redirecionamento.
  const progress =
    step === 'welcome' ? null : step === 'success' ? 1 : state.stepIndex / (TOTAL_QUESTIONS + 2);
  const stepLabel =
    step === 'welcome'
      ? null
      : step === 'success'
        ? 'Concluído'
        : step === 'contact'
          ? 'Último passo'
          : `Pergunta ${state.stepIndex} de ${TOTAL_QUESTIONS}`;

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onStart={next} />;
      case 'location':
        return (
          <LocationStep
            value={state.location}
            onChange={(patch) => dispatch({ type: 'SET_LOCATION', patch })}
            onContinue={next}
          />
        );
      case 'contact':
        return (
          <ContactForm
            value={state.contact}
            cityUf={cityUf(state.location)}
            cnpjRequired={state.answers.establishment !== 'none'}
            sending={state.submission.status === 'sending'}
            submitFailed={state.submission.status === 'failed' || state.submission.status === 'not_configured'}
            whatsappUrl={whatsappUrl}
            onWhatsAppClick={handleWhatsAppClick}
            onChange={(patch) => dispatch({ type: 'SET_CONTACT', patch })}
            onSubmit={handleContactSubmit}
            onEditLocation={() => goToStep('location')}
          />
        );
      case 'success':
        return (
          <SuccessScreen
            autoRedirect={autoRedirect}
            whatsappUrl={whatsappUrl}
            summary={summary}
            onWhatsAppClick={handleWhatsAppClick}
          />
        );
      default:
        return (
          <QuestionCard
            question={QUESTIONS[step]}
            value={state.answers[step]}
            onAnswer={(value) => dispatch({ type: 'SET_ANSWER', id: step, value })}
            onAdvance={next}
          />
        );
    }
  };

  return (
    <QuizLayout
      progress={progress}
      stepLabel={stepLabel}
      onBack={state.stepIndex > 0 && state.submission.status !== 'sending' ? back : undefined}
    >
      <AnimatePresence mode="wait" initial={false} custom={state.direction}>
        <m.div
          key={step}
          custom={state.direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          {renderStep()}
        </m.div>
      </AnimatePresence>

      <DevNotice
        submission={state.submission.status}
        priority={step === 'success' ? `${qualification.priorityLabel} · ${qualification.relationshipTag} · score ${qualification.score}` : undefined}
      />
    </QuizLayout>
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <QuizProvider>
          <QuizFlow />
        </QuizProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
