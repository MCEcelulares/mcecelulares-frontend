import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  pagina: number
  totalPaginas: number
  onChange: (pagina: number) => void
}

function janela(atual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const paginas = new Set([1, total, atual - 1, atual, atual + 1])
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const saida: (number | '…')[] = []
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) saida.push('…')
    saida.push(p)
  })
  return saida
}

const base = 'flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition'

export function Paginacao({ pagina, totalPaginas, onChange }: Props) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        disabled={pagina <= 1}
        onClick={() => onChange(pagina - 1)}
        className={`${base} gap-1 border-slate-200 bg-white hover:border-brand-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-inherit`}
      >
        <ChevronLeft size={16} /> Anterior
      </button>

      {janela(pagina, totalPaginas).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === pagina ? 'page' : undefined}
            className={`${base} ${
              p === pagina
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-200 bg-white hover:border-brand-600 hover:text-brand-600'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        disabled={pagina >= totalPaginas}
        onClick={() => onChange(pagina + 1)}
        className={`${base} gap-1 border-slate-200 bg-white hover:border-brand-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-inherit`}
      >
        Próximo <ChevronRight size={16} />
      </button>
    </nav>
  )
}
