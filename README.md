# MCE Celulares — front-end

Loja virtual da MCE Celulares (React 19 + TypeScript + Vite + Tailwind 4). Consome os microsserviços do
repositório `mce-celulares` por meio do gateway Nginx.

## Rodando

Pré-requisitos: Node 20+ e o back-end no ar (`docker compose up -d` no repositório do back-end; o gateway fica em
`http://localhost:8080`).

```bash
npm install
cp .env.example .env     # ajuste VITE_API_URL se o gateway não estiver em localhost:8080
npm run dev              # http://localhost:4000
```

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 4000) |
| `npm run build` | Checagem de tipos (`tsc`, modo estrito) + build de produção em `dist/` |
| `npm run lint` | `oxlint` |
| `npm run preview` | Serve o build de `dist/` |

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL do gateway dos microsserviços |

O `.env` não vai para o git. Em produção, defina a variável no build da hospedagem.

## Estrutura de `src/`

| Pasta | Conteúdo |
|---|---|
| `pages/` | Uma tela por rota (`conta/` agrupa as telas da área do cliente) |
| `components/` | Peças de interface, agrupadas por assunto (`layout`, `ui` — botões, campos, miniatura, estados vazios —, `produto`, `pedido`, `checkout`, `auth`, `home`) |
| `hooks/` | `useConsulta` (busca de dados), `useFormulario` (formulários), `useAuth`, `useCarrinho`, `useCategorias`, `useProdutosPorId`… |
| `contexts/` | Sessão (`AuthProvider`) e carrinho (`CarrinhoProvider`) |
| `lib/` | Cliente HTTP (`api.ts`), sessão (`auth.ts`), um módulo por serviço, formatação, máscaras e validação |

Dados fixos da empresa (telefone, endereço, horário, e-mail de suporte) ficam em `lib/empresa.ts` e `lib/horario.ts`.

## Convenções

- **Dados:** `useConsulta(buscar, arg)` devolve `{ dados, erro, carregando, recarregar }`. `buscar` deve ser uma função de módulo (estável) e `arg`, um valor simples.
- **Formulários:** `useFormulario` cuida de valores, validação, envio e do mapeamento dos erros da API (`fieldErrors`) para os campos; cada tela informa só as regras e a chamada de envio.
- **Erros da API:** `ApiError` (`lib/api.ts`) traz `status` e `detalhes`; `statusDe(erro)` devolve o status HTTP (0 = sem resposta do servidor).
- **Estilo:** Tailwind 4 com tokens da marca em `index.css` (`brand-*`, `ink`, `surface`); botões via `classeBotao()`; classes de página/cartão/títulos como `@utility`.
- **Fontes:** Inter e Outfit hospedadas localmente (`@fontsource`), sem requisições a terceiros.
- **Cache:** a lista de categorias é buscada uma vez por carregamento de página e compartilhada entre os componentes.
- **Frete, parcelamento, cupons e avaliações não existem:** o back-end não os implementa e o front não os exibe.

## Rotas

Públicas: `/`, `/produtos`, `/produtos/:id`, `/login`, `/cadastro`, `/contato`.
Exigem login: `/carrinho`, `/pedidos`, `/pedidos/:id`, `/conta`, `/conta/enderecos`, `/conta/seguranca`,
`/checkout`, `/checkout/pagamento/:id`, `/checkout/retorno/:id` (para onde o Mercado Pago devolve o cliente; ver
[Pagamento com Mercado Pago](#pagamento-com-mercado-pago)).

## Sessão

O token de acesso fica só em memória. O refresh token (de uso único) fica no `localStorage` com "Manter conectado"
ou no `sessionStorage` sem ele. `apiAutenticada` renova o token sozinho antes de expirar.

## Pagamento com Mercado Pago

O front nunca fala com o Mercado Pago nem guarda chave dele: quem cria o pagamento e confere o resultado é o
`pagamento-service`. O contrato está no ADR-011 do repositório do back-end.

> **Versão de desenvolvimento e testes (sem hospedagem).** Em `localhost` o Mercado Pago **não devolve o cliente à loja**
> (descarta `back_urls` que não sejam `https` públicas) e não consegue enviar o webhook. Por isso o fluxo abaixo termina com o
> cliente voltando à aba da loja e clicando em **Já paguei**. Com um domínio `https` público a volta passaria a ser automática
> (a tela de retorno já existe), mas isso não foi exercitado.

### Fluxo

1. **`/checkout/pagamento/:id`** — "Pagar agora" chama `POST /pagamento/pagamentos`. Com o gateway `mercadopago` a
   resposta traz `url_pagamento` (Checkout Pro): o Mercado Pago abre em uma **nova aba** (`_blank`) e **esta aba vai para o
   pedido** (`/pedidos/:id`). Com o gateway `simulado` (só em desenvolvimento) a resposta já traz o resultado e a tela o mostra.
2. O cliente paga na aba do Mercado Pago. Com URL pública `https` o Mercado Pago o devolveria para
   `{FRONTEND_URL}/checkout/retorno/:id?status=...&payment_id=...`; **em `localhost` isso não acontece**, então ele volta à aba da
   loja, no pedido, e clica em **Já paguei**, que abre a mesma tela de retorno.
3. **`/checkout/retorno/:id`** — pede ao back-end `POST /pagamento/pagamentos/:id/sincronizar`, que consulta o Mercado
   Pago. **A URL de retorno não prova nada**: qualquer um pode digitar `?status=approved`. Ela só escolhe um texto
   (`lib/retornoMercadoPago.ts`); o resultado vem sempre do back-end.

### Telas da confirmação

| Situação | O que o cliente vê | Ações |
|---|---|---|
| Confirmando | "Confirmando seu pagamento..." | — |
| Aprovado | "Pagamento aprovado!"; em 3 s vai ao pedido (`replace`, sem deixar a URL do Mercado Pago no histórico) | Ver meu pedido, Continuar comprando |
| Em processamento (Pix, boleto) | Aviso de que não precisa pagar de novo; a tela confere o pedido a cada 5 s por até 2 min e vira "aprovado" sozinha | Verificar agora, Ver meu pedido |
| Recusado | "Pagamento não aprovado"; o pedido segue reservado até o prazo | Tentar novamente |
| Pago, mas pedido não confirmado | Aviso de erro: não pagar de novo | Falar com a loja |
| Sem pagamento iniciado | "Não encontramos um pagamento para este pedido" | Pagar agora |
| Pedido cancelado durante a espera | "Pedido cancelado" | Falar com a loja |
| Falha ao confirmar | Mensagem do back-end (ex.: limite de tentativas) | Tentar novamente |

Quem já pagou e fechou a janela do Mercado Pago tem "Conferir pagamento" na tela de pagamento e "Já paguei" na lista e
no detalhe do pedido, em vez de pagar duas vezes.

### Peças

| Arquivo | Papel |
|---|---|
| `lib/pagamentos.ts` | `iniciarPagamento`, `sincronizarPagamento`, `urlDePagamentoSegura` (só abre links `https`) |
| `lib/retornoMercadoPago.ts` | Lê `status`/`payment_id` da URL só como dica de texto |
| `hooks/useConfirmarPagamento.ts` | Uma única chamada a `sincronizar` por pedido, mesmo no modo estrito do React (que roda os efeitos duas vezes) |
| `hooks/useAcompanharPedido.ts` | Acompanha só o pedido (`buscarPedido`); **nunca** `sincronizar`, que divide com "Pagar agora" o limite de 30 tentativas de pagamento por 15 min por IP |
| `components/ui/Aviso.tsx` | Faixa de aviso (`info`, `sucesso`, `atencao`, `erro`) |
| `pages/CheckoutPagamento.tsx`, `pages/CheckoutRetorno.tsx` | As duas telas do fluxo |

### Cuidados já tratados

- A aba do Mercado Pago é aberta **no clique** (depois de um `await` o navegador a bloquearia como pop-up) e fica em branco
  até o link chegar; é aberta **sem `opener`**, então a página do Mercado Pago não alcança a loja. Se der erro, se o link for
  inseguro ou se o gateway for o simulado (sem link), a aba em branco é **fechada**.
- Se o navegador **bloquear o pop-up**, o fluxo cai para a mesma aba ("Redirecionando para o Mercado Pago...").
- O botão "Pagar agora" fica travado até a página sair: um segundo clique criaria outro pagamento (3 cliques seguidos geram
  1 pagamento).
- Só se abre `url_pagamento` se for `https`; qualquer outra coisa (`http:`, `javascript:`, texto) mostra erro e não sai da loja.
- O retorno exige login. Com a sessão expirada, o cliente entra e volta para a mesma URL de retorno (o refresh token
  fica no `localStorage`, ou no `sessionStorage` sem "Manter conectado"; o Checkout Pro abre na mesma aba, então
  ambos sobrevivem à ida e volta).
- Pedido de outro usuário ou inexistente devolve 403/404 e a tela diz "não encontramos"; falha de rede ou 5xx mostra
  "Não foi possível carregar" com "Tentar novamente".

### Para rodar com o Mercado Pago

No `pagamento-service/.env` do back-end: `GATEWAY_PAGAMENTO=mercadopago`, `MERCADOPAGO_ACCESS_TOKEN` (do **vendedor de teste**) e
`FRONTEND_URL=http://localhost:4000`. Depois, `docker compose up -d --force-recreate pagamento`. O webhook (`PUBLIC_BASE_URL`) é
opcional e exige URL pública; sem ele o fluxo continua completo: **Já paguei** confirma pelo `sincronizar`.

Para testar uma compra:
1. Entre na loja, finalize um pedido e clique em **Pagar agora**.
2. Na aba do Mercado Pago, use uma **janela anônima** e o **comprador de teste** (nunca a conta pessoal: o Mercado Pago recusa
   com "Uma das partes com as quais você está tentando efetuar o pagamento é de teste"). Cartão de teste e titular `APRO`
   (aprovado), `CONT` (pendente) ou `OTHE` (recusado): veja o README do `pagamento-service`.
3. Volte à aba da loja (no pedido) e clique em **Já paguei**.

Com `GATEWAY_PAGAMENTO=simulado` nada disso é necessário: o pagamento é aprovado na hora, sem aba nova.

## Marca

Logos em `public/img/`: `logo-mcecelulares.png` (branca, para fundos escuros) e `logo-mcecelulares-roxo.png` (para
fundos claros). O ícone da aba troca entre `favicon-roxo.png` (tema claro) e `favicon-branco.png` (tema escuro).
