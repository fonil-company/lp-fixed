import type { ChoiceQuestionId, StateOptionId } from './config/quiz';

export type Answers = Partial<Record<ChoiceQuestionId, string>>;

export interface LocationAnswer {
  state: StateOptionId | null;
  /** UF final: 'PI' ou 'MA'. */
  uf: string;
  city: string;
}

/** Formulário final: somente nome, telefone (WhatsApp) e CNPJ. */
export interface ContactData {
  name: string;
  whatsapp: string;
  cnpj: string;
}

/**
 * idle            – ainda não enviado
 * sending         – envio em andamento
 * ok              – CRM confirmou o recebimento (HTTP 2xx)
 * not_configured  – endpoint de CRM ausente: nada foi salvo
 * failed          – endpoint configurado, mas o envio falhou
 */
export type SubmissionStatus = 'idle' | 'sending' | 'ok' | 'not_configured' | 'failed';

export interface QuizState {
  stepIndex: number;
  direction: 1 | -1;
  answers: Answers;
  location: LocationAnswer;
  contact: ContactData;
  leadId: string;
  startedAt: string;
  submission: {
    status: SubmissionStatus;
    submittedAt?: string;
    /** Assinatura dos dados enviados com sucesso — evita reenvio idêntico. */
    signature?: string;
    /** Assinatura dos dados que o webhook do estado confirmou (2xx). */
    stateSignature?: string;
    /** Assinatura dos dados que o CRM Fonil confirmou (2xx). Só então o evento Lead é disparado. */
    crmSignature?: string;
  };
}
