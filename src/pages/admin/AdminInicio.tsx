import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { temPermissao } from '../../lib/permissoes'
import { SECOES } from './secoes'

export default function AdminInicio() {
  const { usuario } = useAuth()
  const secoes = SECOES.filter((s) => temPermissao(usuario, s.permissao))

  return (
    <div>
      <h1 className="titulo-pagina">Olá, {usuario?.nome.split(' ')[0]}</h1>
      <p className="mt-2 text-slate-600">Escolha o que você quer gerenciar na loja.</p>

      {secoes.length === 0 ? (
        <p className="mt-8 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Seu cargo ainda não tem nenhuma tela de gestão liberada.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {secoes.map(({ to, rotulo, descricao, icone: Icone }) => (
            <li key={to}>
              <Link to={to} className="cartao flex h-full flex-col gap-3 p-6 transition hover:border-brand-600">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icone size={22} /></span>
                <span className="titulo-card">{rotulo}</span>
                <span className="text-sm text-slate-600">{descricao}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
