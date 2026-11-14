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
`/checkout`, `/checkout/pagamento/:id`.

## Sessão

O token de acesso fica só em memória. O refresh token (de uso único) fica no `localStorage` com "Manter conectado"
ou no `sessionStorage` sem ele. `apiAutenticada` renova o token sozinho antes de expirar.

## Marca

Logos em `public/img/`: `logo-mcecelulares.png` (branca, para fundos escuros) e `logo-mcecelulares-roxo.png` (para
fundos claros). O ícone da aba troca entre `favicon-roxo.png` (tema claro) e `favicon-branco.png` (tema escuro).
