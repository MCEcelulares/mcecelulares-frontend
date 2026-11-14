import { Link, Outlet, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import { ANO_ATUAL, EMPRESA } from '../../lib/empresa'
import { BarraSuperior } from './BarraSuperior'
import { Logo } from './Logo'

const ETAPAS = ['Identificação', 'Entrega', 'Pagamento']

function Etapas({ atual }: { atual: number }) {
  return (
    <ol className="flex items-center gap-1.5 text-sm font-semibold sm:gap-3" aria-label="Etapas da compra">
      {ETAPAS.map((nome, i) => {
        const numero = i + 1
        const concluida = numero < atual
        const ativa = numero === atual
        return (
          <li key={nome} className="flex items-center gap-1.5 sm:gap-3" aria-current={ativa ? 'step' : undefined}>
            {i > 0 && <span className={`hidden h-px w-6 sm:block ${concluida || ativa ? 'bg-brand-600' : 'bg-slate-300'}`} />}
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs sm:h-7 sm:w-7 ${
                concluida || ativa ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {concluida ? <Check size={14} /> : numero}
            </span>
            <span className={`${ativa ? 'text-brand-600' : concluida ? 'text-brand-600' : 'text-slate-400'} ${ativa ? '' : 'hidden sm:inline'}`}>
              {nome}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function CheckoutLayout() {
  const { pathname } = useLocation()
  const etapa = pathname.startsWith('/checkout/pagamento') ? 3 : 2

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm">
        <BarraSuperior />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-6">
          <Logo />
          <Etapas atual={etapa} />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-slate-500">
          <span>
            Precisa de ajuda? <Link to="/contato" className="font-semibold text-brand-600 hover:underline">Fale conosco</Link> ou ligue {EMPRESA.telefone}
          </span>
          <span>© {ANO_ATUAL} {EMPRESA.nome}</span>
        </div>
      </footer>
    </div>
  )
}
