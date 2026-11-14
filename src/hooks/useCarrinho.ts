import { useContext } from 'react'
import { CarrinhoContext } from '../contexts/carrinhoContext'

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext)
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de <CarrinhoProvider>')
  return ctx
}
