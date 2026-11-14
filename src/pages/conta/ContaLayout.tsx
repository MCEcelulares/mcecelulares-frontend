import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, MapPin, Package, ShieldCheck, User, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ITENS: { to: string; rotulo: string; icone: LucideIcon; end?: boolean }[] = [
  { to: '/conta', rotulo: 'Minha Conta', icone: User, end: true },
  { to: '/pedidos', rotulo: 'Meus Pedidos', icone: Package },
  { to: '/conta/enderecos', rotulo: 'Endereços Cadastrados', icone: MapPin },
  { to: '/conta/seguranca', rotulo: 'Segurança e Senha', icone: ShieldCheck },
]

const iniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

export default function ContaLayout() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()

  const handleSair = async () => {
    await sair()
    navigate('/')
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[280px_1fr] lg:gap-12">
      <aside className="min-w-0 lg:border-r lg:border-slate-200 lg:pr-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 titulo-secao text-white" aria-hidden="true">
            {iniciais(usuario?.nome ?? '')}
          </span>
          <div className="min-w-0">
            <p className="truncate titulo-card">{usuario?.nome}</p>
            <p className="truncate text-sm text-slate-500">{usuario?.email}</p>
          </div>
        </div>

        <nav aria-label="Menu da conta" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {ITENS.map(({ to, rotulo, icone: Icone, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icone size={18} /> {rotulo}
            </NavLink>
          ))}
          <button
            onClick={handleSair}
            className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} /> Sair da Conta
          </button>
        </nav>
      </aside>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
