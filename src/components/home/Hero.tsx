import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { urlImagem } from '../../lib/api'
import type { Produto } from '../../lib/catalogo'
import { formatarPreco } from '../../lib/formatar'
import { classeBotao } from '../ui/botao'

const INTERVALO_MS = 6000

export function Hero({ produtos }: { produtos: Produto[] }) {
  const [indice, setIndice] = useState(0)
  const itens = produtos.slice(0, 5)

  useEffect(() => {
    if (itens.length < 2) return
    const timer = setInterval(() => setIndice((i) => (i + 1) % itens.length), INTERVALO_MS)
    return () => clearInterval(timer)
  }, [itens.length])

  const produto = itens[indice]
  if (!produto) return null
  const imagem = urlImagem(produto.imagem)

  return (
    <section className="pagina pt-8">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-50 via-white to-brand-100 ring-1 ring-brand-100">
        <div className="grid items-center gap-8 px-8 py-10 md:grid-cols-2 md:px-14 md:py-14">
          <div key={produto.id_produto} className="order-2 md:order-1">
            <span className="inline-block rounded-full bg-brand-600/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-600 uppercase">
              Em destaque · {produto.categoria?.nome ?? 'Oferta'}
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight font-extrabold md:text-5xl">{produto.nome}</h1>
            {produto.descricao && (
              <p className="mt-4 line-clamp-3 max-w-lg text-base text-slate-600">{produto.descricao}</p>
            )}
            <p className="mt-6 font-display text-3xl font-bold text-brand-700">{formatarPreco(produto.preco)}</p>
            <Link
              to={`/produtos/${produto.id_produto}`}
              className={classeBotao('primario', 'md', 'mt-6 inline-flex items-center gap-2 shadow-lg shadow-brand-600/25')}
            >
              Ver produto <ArrowRight size={18} />
            </Link>
          </div>

          <div className="order-1 flex h-64 items-center justify-center md:order-2 md:h-96">
            {imagem && (
              <img
                key={produto.id_produto}
                src={imagem}
                alt={produto.nome}
                className="h-full w-full rounded-2xl object-contain mix-blend-multiply"
              />
            )}
          </div>
        </div>

        {itens.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {itens.map((p, i) => (
              <button
                key={p.id_produto}
                onClick={() => setIndice(i)}
                aria-label={`Destaque ${i + 1}: ${p.nome}`}
                className={`h-2 rounded-full transition-all ${i === indice ? 'w-8 bg-brand-600' : 'w-2 bg-brand-600/30'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
