# MCE Celulares: front-end

Loja virtual feita com React 19, TypeScript, Vite e Tailwind. Ela fala com os microsserviços do repositório `mce-celulares` pelo gateway (`http://localhost:8080`).

## Como rodar

Precisa de Node 20+ e do back-end no ar (`docker compose up -d` no repositório do back-end).

```bash
npm install
cp .env.example .env     # ajuste VITE_API_URL só se o gateway não estiver em localhost:8080
npm run dev              # http://localhost:4000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 4000) |
| `npm run build` | Confere os tipos e gera o build em `dist/` |
| `npm run lint` | Confere o código com o `oxlint` |

## Pastas de `src/`

| Pasta | Conteúdo |
|---|---|
| `pages/` | Uma tela por rota (`conta/` e `admin/` agrupam as áreas do cliente e do administrador) |
| `components/` | Peças de interface (layout, botões, campos, avisos, produto, pedido, admin) |
| `hooks/` | Lógica reaproveitável (busca de dados, formulários, sessão, carrinho) |
| `contexts/` | Sessão e carrinho, compartilhados pelo site todo |
| `lib/` | Chamadas à API, formatação, máscaras e validação |

## Telas

- **Públicas:** início, produtos, detalhe do produto, login, cadastro e contato.
- **Com login:** carrinho, checkout, pagamento, pedidos e conta (dados, endereços e senha).
- **Painel administrativo** (`/admin`, só com a permissão `painel:acessar`):

| Tela | O que faz |
|---|---|
| Painel de vendas | Receita, pedidos por status e produtos mais vendidos |
| Produtos | Cadastro, edição, inativação, ajuste de estoque e imagem |
| Categorias e marcas | Criar, renomear, inativar e excluir |
| Usuários | Editar dados, ativar ou inativar e definir cargos |
| Pedidos | Acompanhar, marcar como enviado ou entregue e cancelar |

A tela esconde o que o usuário não pode usar, mas **quem decide é o back-end**, que confere a permissão em cada chamada.

## Pagamento

"Pagar agora" abre o Mercado Pago em uma **nova aba**, e esta aba mostra o pedido. Em `localhost` o Mercado Pago não devolve o cliente à loja, então depois de pagar volte à aba do pedido e clique em **Já paguei**: a tela de retorno pede ao back-end que confira o pagamento no Mercado Pago. A URL de retorno nunca vale como prova, porque qualquer pessoa poderia digitar `?status=approved`. Detalhes de configuração e de teste estão no README do back-end.

## Sessão

O token de acesso fica só na memória. O refresh token fica no `localStorage` (com "Manter conectado") ou no `sessionStorage` (sem ele), e a sessão é renovada sozinha antes de expirar.
