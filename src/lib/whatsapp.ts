import { WHATSAPP_NUMBERS } from '../config/env';
import { WHATSAPP_INTRO } from '../config/quiz';
import type { QuizState } from '../types';
import { cityUf, optionLabel } from './answers';
import { maskCnpj, maskPhone } from './validation';

/** Mensagem que já chega pronta para o consultor, com os dados do formulário e o essencial do quiz. */
export function buildWhatsAppMessage(state: QuizState): string {
  const { contact, location, answers } = state;
  const lines = [
    WHATSAPP_INTRO,
    '',
    `Nome: ${contact.name.trim()}`,
    `Telefone: ${maskPhone(contact.whatsapp)}`,
    `CNPJ: ${maskCnpj(contact.cnpj) || 'Não informado'}`,
    `Cidade/UF: ${cityUf(location) || location.uf}`,
    `Negócio: ${optionLabel('establishment', answers.establishment)}`,
    `Previsão de compra: ${optionLabel('timing', answers.timing)}`,
  ];
  return lines.join('\n');
}

/** Piauí → consultor do PI; Maranhão → consultor do MA. */
export function whatsAppNumberFor(uf: string): string {
  return uf === 'MA' ? WHATSAPP_NUMBERS.MA : WHATSAPP_NUMBERS.PI;
}

/** https://wa.me/NUMERO?text=MENSAGEM */
export function buildWhatsAppUrl(message: string, number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
