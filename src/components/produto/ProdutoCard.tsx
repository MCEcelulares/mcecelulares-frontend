import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import { urlImagem } from '../../lib/api'
import type { Produto } from '../../lib/catalogo'
import { formatarPreco } from '../../lib/formatar'

export function ProdutoCard({ produto }: { produto: Produto }) {
  const imagem = urlImagem(produto.imagem)
  const semEstoque = produto.estoque <= 0

  return (
    <Link
      to={`/produtos/${produto.id_produto}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {imagem ? (
          <img
            src={imagem}
            alt={produto.nome}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-6 transition group-hover:scale-105"
          />
        ) : (
          <ImageOff size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
        )}
        {semEstoque && (
          <span className="absolute top-3 left-3 rounded-md bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white">
            Indisponível
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
        <span className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
          {produto.marca?.nome ?? produto.categoria?.nome}
        </span>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium text-slate-800">{produto.nome}</h3>
        <p className="mt-3 font-display text-2xl font-bold">{formatarPreco(produto.preco)}</p>
        <span className="mt-4 rounded-lg bg-brand-50 py-2 text-center text-sm font-semibold text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
          Ver produto
        </span>
      </div>
    </Link>
  )
}

export function ProdutoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  )
}
