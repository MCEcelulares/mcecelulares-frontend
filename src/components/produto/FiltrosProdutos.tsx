import { useState, type FormEvent } from 'react'
import type { Categoria, Marca } from '../../lib/catalogo'

export interface FiltrosAtivos {
  categoria: string | null
  marca: string | null
  precoMin: string | null
  precoMax: string | null
  disponivel: boolean
}

interface Props {
  categorias: Categoria[]
  marcas: Marca[]
  filtros: FiltrosAtivos
  onChange: (mudancas: Record<string, string | null>) => void
}

const titulo = 'mb-3 text-sm font-bold tracking-wide uppercase'

function FiltroPreco({ min, max, onChange }: { min: string | null; max: string | null; onChange: Props['onChange'] }) {
  const [valorMin, setValorMin] = useState(min ?? '')
  const [valorMax, setValorMax] = useState(max ?? '')
  const invalido = valorMin !== '' && valorMax !== '' && Number(valorMin) > Number(valorMax)

  const aplicar = (e: FormEvent) => {
    e.preventDefault()
    if (invalido) return
    onChange({ precoMin: valorMin || null, precoMax: valorMax || null })
  }

  const campo =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

  return (
    <form onSubmit={aplicar}>
      <div className="flex items-center gap-2">
        <input type="number" min={0} inputMode="decimal" placeholder="Mín" aria-label="Preço mínimo" value={valorMin} onChange={(e) => setValorMin(e.target.value)} className={campo} />
        <span className="text-slate-400">–</span>
        <input type="number" min={0} inputMode="decimal" placeholder="Máx" aria-label="Preço máximo" value={valorMax} onChange={(e) => setValorMax(e.target.value)} className={campo} />
      </div>
      {invalido && <p className="mt-2 text-xs text-red-600">O mínimo não pode ser maior que o máximo.</p>}
      <button
        type="submit"
        disabled={invalido}
        className="mt-3 w-full rounded-lg bg-brand-50 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-600 hover:text-white disabled:opacity-50"
      >
        Aplicar
      </button>
    </form>
  )
}

export function FiltrosProdutos({ categorias, marcas, filtros, onChange }: Props) {
  const item = (ativo: boolean) =>
    `block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
      ativo ? 'bg-brand-50 font-semibold text-brand-600' : 'text-slate-700 hover:bg-slate-100'
    }`

  return (
    <div className="space-y-8">
      <section>
        <h2 className={titulo}>Categorias</h2>
        <div className="space-y-1">
          <button className={item(!filtros.categoria)} onClick={() => onChange({ categoria: null })}>
            Todos os produtos
          </button>
          {categorias.map((c) => (
            <button
              key={c.id_categoria}
              className={item(filtros.categoria === String(c.id_categoria))}
              onClick={() => onChange({ categoria: String(c.id_categoria) })}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className={titulo}>Marcas</h2>
        <div className="space-y-1">
          <button className={item(!filtros.marca)} onClick={() => onChange({ marca: null })}>
            Todas as marcas
          </button>
          {marcas.map((m) => (
            <button
              key={m.id_marca}
              className={item(filtros.marca === String(m.id_marca))}
              onClick={() => onChange({ marca: String(m.id_marca) })}
            >
              {m.nome}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className={titulo}>Faixa de preço</h2>
        <FiltroPreco key={`${filtros.precoMin}-${filtros.precoMax}`} min={filtros.precoMin} max={filtros.precoMax} onChange={onChange} />
      </section>

      <section>
        <h2 className={titulo}>Disponibilidade</h2>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filtros.disponivel}
            onChange={(e) => onChange({ disponivel: e.target.checked ? 'true' : null })}
            className="h-4 w-4 accent-brand-600"
          />
          Somente em estoque
        </label>
      </section>
    </div>
  )
}
