import { createContext } from 'react'
import type { Carrinho } from '../lib/vendas'

export interface CarrinhoContextValue {
  /** Carrinho do usuário logado; `null` se deslogado ou ainda carregando. */
  carrinho: Carrinho | null
  carregando: boolean
  /** O carrinho não pôde ser carregado (ex.: serviço de Vendas indisponível). */
  erro: boolean
  /** Soma das quantidades de todos os itens (para o contador do header). */
  quantidadeTotal: number
  adicionar: (idProduto: number, quantidade: number) => Promise<void>
  atualizar: (idItem: number, quantidade: number) => Promise<void>
  remover: (idItem: number) => Promise<void>
  /** Busca o carrinho de novo (ex.: depois de criar o pedido, que encerra o carrinho). */
  recarregar: () => Promise<void>
}

export const CarrinhoContext = createContext<CarrinhoContextValue | null>(null)
