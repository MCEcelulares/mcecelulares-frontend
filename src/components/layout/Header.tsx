import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCarrinho } from '../../hooks/useCarrinho'
import { useCategorias } from '../../hooks/useCategorias'
import { formatarPreco } from '../../lib/formatar'
import { BarraSuperior } from './BarraSuperior'
import { Logo } from './Logo'

// Estilo compartilhado por "Minha Conta" e "Carrinho": no hover/foco o círculo do ícone vira roxo e o texto acompanha.
const acaoDoHeader =
  'flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600'
const iconeDoHeader =
  'flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition duration-200 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white group-focus-visible:bg-brand-600 group-focus-visible:text-white'

export function Header() {
  const [busca, setBusca] = useState('')
  const { categorias, carregando } = useCategorias()
  const { usuario, sair } = useAuth()
  const { carrinho, quantidadeTotal } = useCarrinho()
  const navigate = useNavigate()

  const handleSair = async () => {
    await sair()
    navigate('/')
  }

  const handleBusca = (e: FormEvent) => {
    e.preventDefault()
    const termo = busca.trim()
    navigate(termo ? `/produtos?busca=${encodeURIComponent(termo)}` : '/produtos')
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <BarraSuperior />

      {/* Logo, busca e ações */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-4 md:gap-x-6 md:px-6">
        <Logo />

        <form onSubmit={handleBusca} className="order-last w-full md:order-none md:w-auto md:flex-1">
          <div className="mx-auto flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
            <Search size={18} className="text-slate-500" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Busque por iPhone, notebooks, consoles..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">
              Buscar
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0 md:gap-5">
          <Link to={usuario ? '/conta' : '/login'} className={`group ${acaoDoHeader}`}>
            <span className={iconeDoHeader}>
              <User size={20} />
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block max-w-36 truncate text-[11px] text-slate-500">
                {usuario ? `Olá, ${usuario.nome.split(' ')[0]}` : 'Olá, faça seu login'}
              </span>
              <span className="block text-sm font-semibold transition-colors group-hover:text-brand-600">Minha Conta</span>
            </span>
          </Link>
          {usuario && (
            <button
              onClick={handleSair}
              aria-label="Sair"
              title="Sair"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-brand-600"
            >
              <LogOut size={18} />
            </button>
          )}
          <span className="hidden h-8 w-px bg-slate-200 lg:block" />
          <Link to="/carrinho" className={`group ${acaoDoHeader}`} aria-label={`Carrinho, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'item' : 'itens'}`}>
            <span className={`relative ${iconeDoHeader}`}>
              <ShoppingBag size={20} />
              {quantidadeTotal > 0 && (
                <span data-testid="contador-carrinho" className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {quantidadeTotal}
                </span>
              )}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[11px] text-slate-500">Carrinho</span>
              <span className="block text-sm font-semibold transition-colors group-hover:text-brand-600">{formatarPreco(carrinho?.total ?? 0)}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Navegação por categorias */}
      <nav className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-6 py-3">
          <Link
            to="/produtos"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Menu size={16} /> Todas as Categorias
          </Link>
          {carregando &&
            [0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-4 w-24 shrink-0 animate-pulse rounded bg-slate-200" />
            ))}
          {categorias.map(({ id_categoria, nome }) => (
            <NavLink
              key={id_categoria}
              to={`/produtos?categoria=${id_categoria}`}
              className="shrink-0 text-sm font-medium text-slate-700 hover:text-brand-600"
            >
              {nome}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
