import { apiAutenticada } from './auth'

export interface ItemCarrinho {
  id_item_carrinho: number
  id_produto: number
  quantidade: number
  preco_unitario: number
  subtotal: number
}

export interface Carrinho {
  id_carrinho: number
  itens: ItemCarrinho[]
  total: number
}

const normalizar = (c: Carrinho): Carrinho => ({
  ...c,
  total: Number(c.total),
  itens: c.itens.map((i) => ({ ...i, preco_unitario: Number(i.preco_unitario), subtotal: Number(i.subtotal) })),
})

export const buscarCarrinho = () => apiAutenticada<Carrinho>('/vendas/carrinho').then(normalizar)

export const adicionarItem = (idProduto: number, quantidade: number) =>
  apiAutenticada<Carrinho>('/vendas/carrinho/itens', { method: 'POST', json: { idProduto, quantidade } }).then(normalizar)

export const atualizarItem = (idItem: number, quantidade: number) =>
  apiAutenticada<Carrinho>(`/vendas/carrinho/itens/${idItem}`, { method: 'PATCH', json: { quantidade } }).then(normalizar)

export const removerItem = (idItem: number) =>
  apiAutenticada<void>(`/vendas/carrinho/itens/${idItem}`, { method: 'DELETE' })
