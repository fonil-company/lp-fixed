# Quiz de Lojistas — Fixed (MZ3 Cosméticos)

Quiz de qualificação B2B para campanhas Meta Ads da Fixed. React + TypeScript + Tailwind CSS v4 + Framer Motion + Lucide.
Base técnica reaproveitada do quiz Keratex (LEVA001): mesmos webhooks, CRM Fonil, Pixel/CAPI e deploy.

## Fluxo

1. **Abertura** com a headline cromada "Abasteça sua loja com a linha Fixed da MZ3 Cosméticos" + pedido mínimo de R$ 250,00. No topo de todas as telas, a faixa com as logos MZ3 e DEC Rio Piranhas.
2. **6 perguntas:** tipo de negócio · estado/cidade · já vende produtos capilares · valor por pedido · relação com a Fixed · quando quer abastecer.
3. **Formulário:** nome, telefone (WhatsApp) e CNPJ. O CNPJ é obrigatório, exceto para quem marcou "Ainda não tenho loja".
4. **Redirecionamento automático** (≈2 s) para o WhatsApp do consultor do estado, com a mensagem já preenchida (nome, telefone, CNPJ, cidade, tipo de negócio e previsão de compra). Há um botão de reserva caso o WhatsApp não abra.

Se o CRM Fonil não confirmar o envio, a pessoa continua no formulário, pode reenviar e também ganha um link direto para o consultor, para o lead não se perder.

## Rodar

```bash
npm install
cp .env.example .env   # opcional
npm run dev            # http://localhost:5173 — ATENÇÃO: envia leads reais aos webhooks
npm run build          # gera /dist (site estático)
```

## Onde editar

- **Copies, perguntas, opções, ícones, mensagem do WhatsApp e tempo de redirecionamento:** `src/config/quiz.ts`
- **Foto do mix de produtos na abertura:** coloque o arquivo em `public/brand/` e preencha `PRODUCT_MIX_IMAGE` em `src/config/quiz.ts`
- **Regras de qualificação:** `src/lib/qualification.ts`
- **Cores e fontes:** `src/index.css` (paleta do criativo: cobalto `#0065FF`, marinho `#032249`, ciano `#32D7FF`, prata `#B8C1CF`, grafite `#181A20`, âmbar `#EFA95F`; Barlow Condensed ExtraBold Italic + Inter)
- **Logos:** `public/brand/fixed-logo-white.webp` e `fixed-logo-graphite.webp` (gerados do logotipo oficial)

## Qualificação (interna, nunca exibida)

- **Alta:** tem loja, está no PI/MA, já vende produtos capilares e quer comprar o quanto antes ou em até 7 dias.
- **Média:** tem loja e está no PI/MA, mas não cumpre todos os critérios da alta.
- **Fora do perfil inicial:** não tem loja. O lead não é bloqueado e segue para triagem.
- **Tags:** Cliente atual Fixed · Reativação Fixed · Novo cliente potencial · "Abaixo do pedido mínimo" quando o pedido habitual é menor que R$ 250.
- **Score de 0 a 100** (inclui o valor por pedido) para ordenar os leads.

## Configuração (`.env`)

| Variável | Para quê |
|---|---|
| `VITE_WHATSAPP_NUMBER_PI` / `VITE_WHATSAPP_NUMBER_MA` | Opcional. Sobrescreve o WhatsApp de cada estado. Padrão em `src/config/env.ts` (`WHATSAPP_NUMBERS`): **Piauí → 5586993271298**, **Maranhão → 5586995319157**. Ao final, o lead é direcionado ao número do estado que marcou. |
| `VITE_CRM_ENDPOINT_PI` / `VITE_CRM_ENDPOINT_MA` | Opcionais. Sobrescrevem os webhooks por estado. Os webhooks fornecidos já estão configurados em `src/config/env.ts`: **Piauí → Henrique**, **Maranhão → Francisca**. |
| `VITE_CRM_ENDPOINT` | Backend/proxy genérico, usado apenas como fallback para UFs sem webhook estadual. Não substitui os destinos de PI/MA. |
| `FONIL_CRM_TOKEN` | Token do webhook Fonil, lido somente pelo servidor. |
| `VITE_FONIL_PIPELINE_STAGE` | Etapa enviada em `pipeline_stage`, por exemplo `Qualificado`. Vazio omite o campo e preserva o padrão do CRM. |
| `VITE_FONIL_CONSULTANT_PI` / `VITE_FONIL_CONSULTANT_MA` | Nomes dos consultores no CRM. Padrão: Henrique (PI) e Francisca (MA). |
| `VITE_META_PIXEL_ID` | ID do Pixel. Vazio = eventos desligados. |

Em `npm run dev`, um botão amarelo no canto superior direito mostra o que falta configurar e se o lead foi realmente salvo. Ele não aparece no build de produção.

## Integração com o CRM

O envio acontece **no final do quiz**, após validar os dados de contato e o consentimento. Cada lead vai, em paralelo, para três destinos:

1. **Webhook do estado** (payload completo abaixo):
   - **Piauí (`PI`) → webhook do Henrique.**
   - **Maranhão (`MA`) → webhook da Francisca.**
2. **CRM Fonil** (`crm.fonilgroup.com.br`), no formato `{ phone, name, email?, document?, city?, state?, pipeline_stage?, consultant? }` + uma chave por pergunta do quiz. O webhook do CRM não libera CORS, então o navegador posta em `/api/crm-lead` (mesmo domínio) e o servidor repassa para `POST /api/webhooks/leads/{token}`: o `Caddyfile` em produção e o proxy do `vite.config.ts` em `npm run dev`/`preview`. O token fica no servidor; para trocá-lo, defina `FONIL_CRM_TOKEN` nas variáveis de ambiente do Easypanel (e no `.env` local).
3. **CRM Umbrella** (regra de entrada "Quiz - Fixed" na empresa Dec Rio Piranhas, tag `LEAD - FIXED`), via `POST` direto do navegador com `keepalive` para `VITE_UMBRELLA_ENDPOINT` (padrão: o webhook `25221964…`; use `off` para desativar). O Umbrella valida a origem: os domínios da página precisam estar em *Segurança → Origens permitidas*. Campos: `name`, `whatsapp` (DDD + número), `email`/`company` quando houver, `document` (CNPJ, ativa a consulta na Receita), cidade/UF, uma chave por pergunta, `source`, `lead_id` e atribuição (`utm_*`, IDs de clique e anúncio, `_fbc`, `_fbp`, `landingUrl`). Não usamos `UmbrellaTrack.submit` do script do `index.html`: ele envia por `sendBeacon` (com cookies, que o webhook não aceita) e dispara um `Lead` extra no Pixel. Falhas do Umbrella não bloqueiam o quiz.

O JSON do Fonil usa os nomes canônicos do contrato, com `phone` (DDD + número, somente dígitos) e `name` obrigatórios. O CNPJ segue em `document` sem máscara quando preenchido, preservando zeros iniciais e as letras dos CNPJs alfanuméricos já aceitos pelo formulário. `consultant` segue o estado: Henrique para PI e Francisca para MA. `pipeline_stage` só é enviado quando configurado. O formulário não coleta e-mail. Não são enviados valores fictícios para campos opcionais.

A URL de entrada completa (query string e fragmento) segue em `event_source_url`. Todos os `utm_*` e os identificadores `fbclid`, `gclid`, `gbraid`, `wbraid`, `msclkid`, `ttclid`, `campaign`, `campaign_id`, `adset_id`, `ad_id` e `placement` são capturados sem truncamento. Macros de anúncio não resolvidas e valores vazios são omitidos. A atribuição fica na sessão; uma nova campanha explícita substitui a anterior sem misturar cliques. Cookies `_fbc` e `_fbp` são lidos no envio e mapeados exclusivamente para `fbc` e `fbp` no Fonil.

O adaptador Fonil não envia `page_url`, `landing_url`, `landing_page`, `referrer`, `_fbc`, `_fbp`, `event_id`, nem objetos internos de qualificação/contato. O destino estadual continua recebendo o payload interno completo.

**Observações (quiz):** o Fonil exibe em Observações cada campo extra como `chave: valor`. Por isso cada pergunta respondida vai como chave própria, com o texto da pergunta como chave e a resposta como valor, na ordem das telas (ex.: `"Qual é o tipo do seu negócio?": "Farmácia ou drogaria"`). Perguntas sem resposta são omitidas; tracking e contato seguem nos campos próprios.

A tela de conclusão e o evento `Lead` do Pixel/CAPI dependem da confirmação HTTP 2xx do CRM Fonil. Se o Fonil falhar, o formulário mantém os dados e mostra uma mensagem para tentar novamente. Só os destinos ainda pendentes recebem o reenvio; o `eventID` continua sendo o mesmo `lead_id`.

Selecionar ou trocar o estado não dispara um cadastro incompleto. O envio usa `POST` com `Content-Type: application/json`. O `lead_id` segue no corpo; os webhooks estaduais não recebem o header `Idempotency-Key`, pois o CORS deles não o permite. O backend/proxy genérico mantém esse header quando usado.

O backend deve responder 2xx somente depois de gravar o lead e deve usar o `lead_id` para não duplicar registros (o usuário pode voltar, editar e reenviar: o `lead_id` é o mesmo). Deve liberar CORS para o domínio da página e `Content-Type`. As URLs de captação são públicas no navegador; credenciais privadas de acesso ao CRM ficam no backend.

O payload inclui: marca (`Fixed`), contato (nome, WhatsApp, CNPJ ou `null`), cidade/UF, todas as respostas (id + rótulo), a qualificação (`priority`, `score`, `relationship_tag`, `tags`, `reasons`), o consentimento, as UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`), `fbclid`, a landing page e os horários (`started_at`, `submitted_at` em ISO e `submitted_at_local` no fuso de Fortaleza).

Se o Fonil falhar, a pessoa permanece no formulário; não há conclusão nem evento Lead baseado apenas no sucesso do webhook estadual.

### Verificar a integração sem cadastrar leads reais

Execute `node --test tests/crm-tracking.test.mjs` e `npm run build`. Os testes verificam captura de campanha, sessão, visita orgânica, cookies tardios/bloqueados, normalização e envio HTTP pelo proxy Vite real a um receptor local. Também cobrem falha do Fonil e reenvio apenas ao destino pendente. O build de produção mantém o token fora de `dist` e usa o repasse existente do Caddy.

Esses testes não validam visualmente o bloco Origem da campanha ou Observações dentro do CRM, nem confirmam que um deploy ocorreu.

## Meta Pixel

| Evento | Quando dispara |
|---|---|
| `PageView` | Ao carregar a página |
| `ViewContent` | Na primeira pergunta (1x por sessão) |
| `Lead` | Só depois de o **CRM Fonil** confirmar o recebimento (HTTP 2xx). O webhook do estado não conta. 1x por lead, `eventID = lead_id` para deduplicar com a CAPI. Se o CRM falhar, a pessoa pode voltar e reenviar: o site tenta de novo só o CRM e, se confirmar, dispara o Lead. |
| `Contact` | No clique do botão de WhatsApp (1x por lead) |

Pixel ID: `4367782926817920`. O código base do Pixel fica **no `index.html`**, para o PageView disparar antes de o app baixar (melhor connect rate); o mesmo ID está em `src/config/env.ts` — se trocar, troque nos dois.

Nenhum dado pessoal vai nos parâmetros dos eventos (apenas `content_name`, `content_category` e `lead_quality`).

### API de Conversões (CAPI)

Todo evento acima também é enviado pelo servidor, com o **mesmo `event_id`** do Pixel para a Meta deduplicar. O navegador posta em `/api/meta-capi` e o Caddy (ou o proxy do Vite em dev) repassa à Graph API acrescentando o token, que **nunca vai ao navegador nem ao Git**.

- **Produção:** defina `META_CAPI_TOKEN` nas variáveis de ambiente do serviço no Easypanel. Sem ela, a CAPI falha e só o Pixel funciona.
- **Local:** coloque `META_CAPI_TOKEN=...` no `.env` (ignorado pelo Git).
- `user_data`: user agent, cookies `_fbp`/`_fbc` e `external_id` (id do lead) em todos os eventos. Em `Lead` e `Contact` vão também telefone, nome, sobrenome, cidade, UF e país, normalizados e com hash SHA-256.
- Para testar no Gerenciador de Eventos, veja a aba "Eventos de teste" / "Visão geral" do pixel: os eventos do servidor aparecem como "Servidor" e os do navegador como "Navegador".

## Deploy (Easypanel / Nixpacks)

- Node 22 é fixado em `package.json` (`engines`) e `.nvmrc`, porque o Tailwind v4 exige Node 20 ou superior.
- O provider Vite do Nixpacks instala o Caddy automaticamente na fase `caddy`. Não adicione `caddy` em `phases.setup.nixPkgs`: isso instala versões de snapshots Nix diferentes e causa conflito em `caddy-api.service`.
- `nixpacks.toml` roda `npm ci` e `npm run build`, e inicia o servidor com o `Caddyfile` do projeto. Mantenha a detecção automática habilitada (não defina `NIXPACKS_SPA_CADDY=false` no Easypanel).
- O `Caddyfile` serve **somente `/app/dist`**, com o MIME correto, cache longo para `/assets/*`, `no-cache` no `index.html` e fallback para o `index.html`.
- Variáveis `VITE_*` são lidas no momento do build: configure-as no Easypanel e faça um novo deploy sempre que alterá-las.
