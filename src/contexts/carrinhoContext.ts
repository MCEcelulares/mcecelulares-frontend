import { createContext } from 'react'
import type { Carrinho } from '../lib/vendas'

export interface CarrinhoContextValue {
  carrinho: Carrinho | null
  carregando: boolean
  erro: boolean
  quantidadeTotal: number
  adicionar: (idProduto: number, quantidade: number) => Promise<void>
  atualizar: (idItem: number, quantidade: number) => Promise<void>
  remover: (idItem: number) => Promise<void>
  recarregar: () => Promise<void>
}

export const CarrinhoContext = createContext<CarrinhoContextValue | null>(null)
