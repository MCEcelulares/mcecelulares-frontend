import type { ReactNode } from 'react'
import { Miniatura } from '../ui/Miniatura'
import { formatarPreco } from '../../lib/formatar'

interface LinhaResumo {
  chave: number
  nome: string
  quantidade: number
  precoUnitario: number
  imagem?: string | null
}

interface Props {
  itens: LinhaResumo[]
  subtotal: number
  frete?: number
  total: number
  acao?: ReactNode
}

export function ResumoItens({ itens, subtotal, frete = 0, total, acao }: Props) {
  return (
    <aside className="cartao p-6 lg:sticky lg:top-6">
      <h2 className="titulo-secao">Resumo de Itens</h2>

      <ul className="mt-5 space-y-4">
        {itens.map((item) => {
          return (
            <li key={item.chave} className="flex items-center gap-3">
              <Miniatura imagem={item.imagem} tamanho="sm" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-semibold">{item.nome}</span>
                <span className="block text-xs text-slate-500">
                  Qtd: {item.quantidade} · {formatarPreco(item.precoUnitario)}
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <dl className="mt-6 space-y-2 border-t border-slate-200 pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Produtos</dt>
          <dd className="font-semibold">{formatarPreco(subtotal)}</dd>
        </div>
        {frete > 0 && (
          <div className="flex justify-between">
            <dt className="text-slate-600">Frete</dt>
            <dd className="font-semibold">{formatarPreco(frete)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
        <span className="font-semibold">Total:</span>
        <span className="font-display text-3xl font-extrabold text-brand-700">{formatarPreco(total)}</span>
      </div>

      {acao && <div className="mt-6">{acao}</div>}
    </aside>
  )
}
