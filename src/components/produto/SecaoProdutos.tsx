import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Produto } from '../../lib/catalogo'
import { ProdutoCard, ProdutoCardSkeleton } from './ProdutoCard'

interface Props {
  titulo: string
  produtos: Produto[] | null
  carregando: boolean
  linkTodos?: string
}

export function SecaoProdutos({ titulo, produtos, carregando, linkTodos = '/produtos' }: Props) {
  if (!carregando && (!produtos || produtos.length === 0)) return null

  return (
    <section className="pagina py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold md:text-3xl">{titulo}</h2>
        <Link to={linkTodos} className="flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap text-brand-600 hover:underline">
          Ver todos <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {carregando
          ? Array.from({ length: 4 }, (_, i) => <ProdutoCardSkeleton key={i} />)
          : produtos!.slice(0, 4).map((p) => <ProdutoCard key={p.id_produto} produto={p} />)}
      </div>
    </section>
  )
}
