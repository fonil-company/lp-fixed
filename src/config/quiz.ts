/**
 * Configuração centralizada do quiz Fixed.
 * Altere copies, opções e ícones aqui sem mexer na lógica da aplicação.
 * Os `id` das opções são usados pela qualificação de leads (src/lib/qualification.ts):
 * se renomear um id, atualize também a qualificação.
 */
import {
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  Eye,
  Handshake,
  Lightbulb,
  MapPin,
  Pill,
  RotateCcw,
  Scissors,
  Search,
  ShoppingCart,
  Sparkles,
  Sprout,
  TrendingUp,
  Warehouse,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type StepId =
  | 'welcome'
  | 'establishment'
  | 'location'
  | 'resale'
  | 'budget'
  | 'relationship'
  | 'timing'
  | 'contact'
  | 'success';

/**
 * Ordem das telas: abertura → 6 perguntas → formulário → redirecionamento ao WhatsApp.
 * A barra de progresso e o indicador de etapa derivam desta lista.
 */
export const STEP_ORDER: StepId[] = [
  'welcome',
  'establishment',
  'location',
  'resale',
  'budget',
  'relationship',
  'timing',
  'contact',
  'success',
];

/** Número de perguntas exibido no indicador ("Pergunta X de 6"). */
export const TOTAL_QUESTIONS = STEP_ORDER.indexOf('contact') - 1;

export type ChoiceQuestionId = 'establishment' | 'resale' | 'budget' | 'relationship' | 'timing';

export interface QuizOption {
  id: string;
  label: string;
  /** Ícone minimalista exibido no card. */
  icon?: LucideIcon;
  /** Alternativa ao ícone: indicador de nível (1–4), usado nas faixas de valor. */
  level?: number;
}

export interface ChoiceQuestion {
  id: ChoiceQuestionId;
  title: string;
  subtitle: string;
  options: QuizOption[];
  /** Rótulo curto usado na mensagem do WhatsApp e no resumo. */
  summaryLabel: string;
}

export const QUESTIONS: Record<ChoiceQuestionId, ChoiceQuestion> = {
  establishment: {
    id: 'establishment',
    title: 'Qual é o tipo do seu negócio?',
    subtitle: 'Assim conseguimos direcionar você para o atendimento certo.',
    summaryLabel: 'Tipo de negócio',
    options: [
      { id: 'cosmetics', label: 'Loja de cosméticos ou perfumaria', icon: Sparkles },
      { id: 'salon', label: 'Salão de beleza ou barbearia', icon: Scissors },
      { id: 'pharmacy', label: 'Farmácia ou drogaria', icon: Pill },
      { id: 'supermarket', label: 'Supermercado ou mercadinho', icon: ShoppingCart },
      { id: 'distributor', label: 'Distribuidora ou atacado', icon: Warehouse },
      { id: 'none', label: 'Ainda não tenho loja', icon: Lightbulb },
    ],
  },
  resale: {
    id: 'resale',
    title: 'Sua loja já vende gel fixador e produtos para cabelo?',
    subtitle: 'Gel modelador, cola capilar, óleos e reparadores de pontas.',
    summaryLabel: 'Já vende produtos capilares',
    options: [
      { id: 'frequent', label: 'Sim, estão entre os que mais vendem', icon: TrendingUp },
      { id: 'little', label: 'Sim, mas ainda vendo pouco', icon: Sprout },
      { id: 'starting', label: 'Ainda não, quero começar', icon: Sparkles },
    ],
  },
  budget: {
    id: 'budget',
    title: 'Quanto você costuma investir em cada pedido de reposição?',
    subtitle: 'O pedido mínimo da Fixed é de R$ 250,00. Escolha a faixa mais próxima.',
    summaryLabel: 'Valor por pedido',
    options: [
      { id: 'under250', label: 'Menos de R$ 250', level: 1 },
      { id: '250to500', label: 'De R$ 250 a R$ 500', level: 2 },
      { id: '501to1500', label: 'De R$ 501 a R$ 1.500', level: 3 },
      { id: 'above1500', label: 'Acima de R$ 1.500', level: 4 },
    ],
  },
  relationship: {
    id: 'relationship',
    title: 'Você já trabalha com produtos Fixed?',
    subtitle: 'Queremos saber se você está conhecendo a marca ou quer voltar a comprar.',
    summaryLabel: 'Relação com a Fixed',
    options: [
      { id: 'current', label: 'Sim, compro atualmente', icon: BadgeCheck },
      { id: 'stopped', label: 'Já comprei, mas parei', icon: RotateCcw },
      { id: 'aware', label: 'Conheço, mas nunca comprei', icon: Eye },
      { id: 'unaware', label: 'Ainda não conheço a Fixed', icon: Handshake },
    ],
  },
  timing: {
    id: 'timing',
    title: 'Quando você quer abastecer sua loja?',
    subtitle: 'Última pergunta! Isso ajuda o consultor a preparar o seu atendimento.',
    summaryLabel: 'Previsão de compra',
    options: [
      { id: 'asap', label: 'O quanto antes', icon: Zap },
      { id: '7days', label: 'Nos próximos 7 dias', icon: CalendarDays },
      { id: '30days', label: 'Nos próximos 30 dias', icon: CalendarRange },
      { id: 'researching', label: 'Só estou pesquisando fornecedores', icon: Search },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Localização (define o consultor e o WhatsApp de destino)            */
/* ------------------------------------------------------------------ */

export type StateOptionId = 'PI' | 'MA';

export const LOCATION_STEP = {
  title: 'Em qual estado fica a sua loja?',
  subtitle: 'Cada estado tem um consultor dedicado para atender você.',
  options: [
    { id: 'PI', label: 'Piauí', icon: MapPin },
    { id: 'MA', label: 'Maranhão', icon: MapPin },
  ] as (QuizOption & { id: StateOptionId })[],
  cityLabel: 'Cidade',
  cta: 'Continuar',
};

/** Sugestões de autocompletar (o campo aceita qualquer cidade). */
export const CITY_SUGGESTIONS: Record<'PI' | 'MA', string[]> = {
  PI: [
    'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Barras', 'Campo Maior',
    'União', 'Altos', 'Esperantina', 'José de Freitas', 'Pedro II', 'Oeiras',
    'São Raimundo Nonato', 'Bom Jesus', 'Corrente', 'Luís Correia', 'Valença do Piauí',
  ],
  MA: [
    'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Paço do Lumiar',
    'Codó', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês', 'Pinheiro', 'Chapadinha',
    'Barra do Corda', 'Grajaú', 'Itapecuru Mirim', 'Coroatá', 'Presidente Dutra',
  ],
};

/* ------------------------------------------------------------------ */
/* Copies das telas fixas                                              */
/* ------------------------------------------------------------------ */

/**
 * Foto do mix de produtos na abertura (opcional). Coloque o arquivo em `public/brand/`
 * e informe o caminho, ex.: '/brand/fixed-mix.webp'. Vazio = abertura sem foto.
 */
export const PRODUCT_MIX_IMAGE = '';

export const WELCOME_COPY = {
  eyebrow: 'Para lojistas do Piauí e Maranhão',
  /** Headline: "Abasteça sua loja com a linha [logo Fixed] da MZ3 Cosméticos". */
  headlineTop: 'Abasteça sua loja',
  signatureBefore: 'com a linha',
  headlineBottom: 'da MZ3 Cosméticos',
  offerLabel: 'Pedido mínimo de',
  offerValue: 'R$ 250,00',
  subheadline:
    'Gel modelador, colas capilares, óleos e reparadores de pontas Fixed para revender na sua loja.',
  benefits: [
    'Mix completo Fixed para revenda',
    'Pedido mínimo de apenas R$ 250,00',
    'Atendimento direto com consultor no WhatsApp',
  ],
  cta: 'Quero abastecer minha loja',
  microcopy: '6 perguntas rápidas · menos de 1 minuto',
};

export const CONTACT_COPY = {
  title: 'Falta pouco! Seu consultor Fixed já vai te atender.',
  subtitle: 'Preencha seus dados e você será levado direto ao WhatsApp do consultor da sua região.',
  fields: {
    name: { label: 'Nome completo', placeholder: 'Seu nome e sobrenome' },
    whatsapp: { label: 'Telefone (WhatsApp)', placeholder: '(86) 99999-9999' },
    cnpj: { label: 'CNPJ da loja', placeholder: '00.000.000/0000-00', optionalHint: 'Opcional' },
  },
  /** Exibido abaixo do botão; enviar o formulário equivale ao aceite. */
  consent: 'Ao continuar, você autoriza a equipe comercial Fixed a falar com você pelo WhatsApp informado.',
  cta: 'Falar com o consultor',
  sending: 'Enviando…',
};

export const SUCCESS_COPY = {
  title: 'Tudo certo! Abrindo o WhatsApp do seu consultor…',
  subtitleRedirect: 'Você será redirecionado em instantes. Se o WhatsApp não abrir, toque no botão abaixo.',
  /** Quando a pessoa volta para a página depois de já ter ido ao WhatsApp. */
  subtitleReturn: 'Seus dados já foram enviados. Toque no botão abaixo para voltar à conversa com o consultor.',
  cta: 'Abrir WhatsApp do consultor',
};

export const WHATSAPP_INTRO =
  'Olá! Respondi o quiz da Fixed e quero abastecer minha loja. Pode me passar o mix e as condições?';

/** Tempo da tela de confirmação antes de abrir o WhatsApp (dá tempo de enviar o evento Lead). */
export const REDIRECT_DELAY_MS = 2200;
