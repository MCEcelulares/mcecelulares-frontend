import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { temPermissao } from '../../lib/permissoes'
import { SECOES } from './secoes'

const estiloLink = ({ isActive }: { isActive: boolean }) =>
  `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-100'
  }`

export default function AdminLayout() {
  const { usuario } = useAuth()
  const secoes = SECOES.filter((s) => temPermissao(usuario, s.permissao))

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr] lg:gap-12">
      <aside className="min-w-0 lg:border-r lg:border-slate-200 lg:pr-8">
        <p className="titulo-card">Painel administrativo</p>
        <p className="mt-1 truncate text-sm text-slate-500">{usuario?.nome}</p>

        <nav aria-label="Menu do painel" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          <NavLink to="/admin" end className={estiloLink}>
            <Home size={18} /> Início
          </NavLink>
          {secoes.map(({ to, rotulo, icone: Icone }) => (
            <NavLink key={to} to={to} className={estiloLink}>
              <Icone size={18} /> {rotulo}
            </NavLink>
          ))}
          <Link to="/" className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap text-slate-500 transition hover:bg-slate-100">
            <ArrowLeft size={18} /> Voltar à loja
          </Link>
        </nav>
      </aside>

      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
