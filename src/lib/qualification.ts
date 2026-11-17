/**
 * Classificação interna e automática dos leads. Nunca exibida ao usuário.
 *
 * Alta prioridade:     tem loja + PI/MA + já vende produtos capilares + compra imediata ou em 7 dias.
 * Média prioridade:    tem loja + PI/MA, mas não cumpre todos os critérios de alta.
 * Fora do perfil:      não tem loja OU está fora de PI/MA (não é bloqueado — vai para triagem).
 *
 * O `score` (0–100) é complementar e considera também o valor por pedido,
 * permitindo ordenar leads dentro de uma mesma prioridade no CRM.
 */
import type { Answers, LocationAnswer } from '../types';

export type LeadPriority = 'alta' | 'media' | 'fora_do_perfil';

export const PRIORITY_LABEL: Record<LeadPriority, string> = {
  alta: 'Alta prioridade',
  media: 'Média prioridade',
  fora_do_perfil: 'Fora do perfil inicial',
};

export type RelationshipTag = 'Cliente atual Fixed' | 'Reativação Fixed' | 'Novo cliente potencial';

export interface Qualification {
  priority: LeadPriority;
  priorityLabel: string;
  relationshipTag: RelationshipTag;
  score: number;
  tags: string[];
  reasons: string[];
}

const SERVED_UFS = new Set(['PI', 'MA']);

const SCORE = {
  establishment: { has: 20, none: 0 },
  region: { inside: 20, outside: 0 },
  resale: { frequent: 20, little: 12, starting: 5 } as Record<string, number>,
  timing: { asap: 20, '7days': 16, '30days': 8, researching: 2 } as Record<string, number>,
  budget: { above1500: 20, '501to1500': 15, '250to500': 10, under250: 3 } as Record<string, number>,
};

export function relationshipTagFor(relationship?: string): RelationshipTag {
  if (relationship === 'current') return 'Cliente atual Fixed';
  if (relationship === 'stopped') return 'Reativação Fixed';
  return 'Novo cliente potencial';
}

export function qualifyLead(answers: Answers, location: LocationAnswer): Qualification {
  const hasEstablishment = !!answers.establishment && answers.establishment !== 'none';
  const inRegion = SERVED_UFS.has(location.uf);
  const sellsHairCare = answers.resale === 'frequent' || answers.resale === 'little';
  const buysSoon = answers.timing === 'asap' || answers.timing === '7days';
  const belowMinimum = answers.budget === 'under250';

  const reasons: string[] = [];
  reasons.push(hasEstablishment ? 'Possui loja/estabelecimento' : 'Ainda não possui loja');
  reasons.push(inRegion ? `Localizado em ${location.uf} (região atendida)` : `Fora da região inicial (${location.uf || 'UF não informada'})`);
  reasons.push(sellsHairCare ? 'Já vende produtos capilares' : 'Ainda não vende produtos capilares');
  reasons.push(buysSoon ? 'Compra imediata ou em até 7 dias' : 'Sem compra imediata prevista');
  if (belowMinimum) reasons.push('Pedido habitual abaixo do mínimo de R$ 250');

  let priority: LeadPriority;
  if (!hasEstablishment || !inRegion) priority = 'fora_do_perfil';
  else if (sellsHairCare && buysSoon) priority = 'alta';
  else priority = 'media';

  const score =
    (hasEstablishment ? SCORE.establishment.has : SCORE.establishment.none) +
    (inRegion ? SCORE.region.inside : SCORE.region.outside) +
    (SCORE.resale[answers.resale ?? ''] ?? 0) +
    (SCORE.timing[answers.timing ?? ''] ?? 0) +
    (SCORE.budget[answers.budget ?? ''] ?? 0);

  const relationshipTag = relationshipTagFor(answers.relationship);

  const tags = [PRIORITY_LABEL[priority], relationshipTag];
  if (location.uf) tags.push(`UF ${location.uf}`);
  if (!hasEstablishment) tags.push('Sem loja');
  if (!inRegion) tags.push('Fora da região inicial');
  if (belowMinimum) tags.push('Abaixo do pedido mínimo');
  if (answers.timing === 'researching') tags.push('Pesquisando fornecedores');

  return {
    priority,
    priorityLabel: PRIORITY_LABEL[priority],
    relationshipTag,
    score,
    tags,
    reasons,
  };
}
