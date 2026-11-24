import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { BotaoConfirmar } from '../../components/admin/BotaoConfirmar'
import { Aviso } from '../../components/ui/Aviso'
import { Campo, CampoSelect } from '../../components/ui/Campo'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { Paginacao } from '../../components/ui/Paginacao'
import { useAuth } from '../../hooks/useAuth'
import { useConsulta } from '../../hooks/useConsulta'
import { alterarStatusUsuario, listarCargos, listarUsuarios, type UsuarioResumo } from '../../lib/admin'
import { mensagemDe } from '../../lib/api'
import { PERMISSAO, temPermissao } from '../../lib/permissoes'
import { classeBotao } from '../../components/ui/botao'

const LIMITE = 10

// Sem a permissão de ver cargos o filtro some em vez de dar erro na tela.
const cargosDoFiltro = () => listarCargos().catch(() => [])

export default function AdminUsuarios() {
  const { usuario } = useAuth()
  const [sp, setSp] = useSearchParams()
  const busca = sp.get('busca') ?? ''
  const cargo = sp.get('cargo') ?? ''
  const situacao = sp.get('situacao') ?? ''
  const pagina = Math.max(1, Number(sp.get('pagina')) || 1)

  const [texto, setTexto] = useState(busca)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  const query = new URLSearchParams({ limit: String(LIMITE), page: String(pagina) })
  if (busca) query.set('busca', busca)
  if (cargo) query.set('cargo', cargo)
  if (situacao) query.set('ativo', situacao === 'ativos' ? 'true' : 'false')

  const { dados, erro, carregando, recarregar } = useConsulta(listarUsuarios, query.toString())
  const cargos = useConsulta(cargosDoFiltro).dados ?? []
  const podeEditar = temPermissao(usuario, PERMISSAO.usuariosEditar)

  const filtrar = (mudancas: Record<string, string | null>, novaPagina = 1) => {
    const novo = new URLSearchParams(sp)
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor) novo.set(chave, valor)
      else novo.delete(chave)
    }
    if (novaPagina > 1) novo.set('pagina', String(novaPagina))
    else novo.delete('pagina')
    setSp(novo)
  }

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    filtrar({ busca: texto.trim() || null })
  }

  const mudarStatus = async (u: UsuarioResumo, ativo: boolean) => {
    setErroAcao(null)
    try {
      await alterarStatusUsuario(u.id_usuario, ativo)
      await recarregar()
    } catch (e) {
      setErroAcao(mensagemDe(e, 'Não foi possível alterar a conta. Tente novamente.'))
    }
  }

  const totalPaginas = dados?.paginacao.totalPaginas ?? 0

  return (
    <div>
      <h1 className="titulo-pagina">Usuários</h1>

      <form onSubmit={buscar} className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr]">
        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <Campo label="Buscar por nome ou e-mail" value={texto} onChange={(e) => setTexto(e.target.value)} className="flex-1" />
          <button type="submit" aria-label="Buscar" className={classeBotao('primario', 'sm', 'mb-0.5 flex items-center')}><Search size={16} /></button>
        </div>
        {cargos.length > 0 && (
          <CampoSelect label="Cargo" value={cargo} onChange={(e) => filtrar({ cargo: e.target.value || null })}>
            <option value="">Todos</option>
            {cargos.map((c) => <option key={c.id_cargo} value={c.nome}>{c.nome}</option>)}
          </CampoSelect>
        )}
        <CampoSelect label="Situação" value={situacao} onChange={(e) => filtrar({ situacao: e.target.value || null })}>
          <option value="">Todas</option>
          <option value="ativos">Ativas</option>
          <option value="inativos">Inativas</option>
        </CampoSelect>
      </form>

      {erroAcao && <Aviso tom="erro" className="mt-4">{erroAcao}</Aviso>}

      <div className="mt-6">
        {erro ? (
          <Aviso tom="erro">Não foi possível carregar os usuários. {erro.message}</Aviso>
        ) : carregando ? (
          <Carregando />
        ) : dados && dados.dados.length > 0 ? (
          <div className="cartao overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <tr><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Cargos</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.dados.map((u) => (
                  <tr key={u.id_usuario} className={u.ativo ? '' : 'bg-slate-50 text-slate-500'}>
                    <td className="px-4 py-3"><span className="block font-semibold text-slate-900">{u.nome}</span><span className="text-xs text-slate-500">{u.email}</span></td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1.5">
                        {u.cargos.map((c) => <span key={c.id_cargo} className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">{c.nome}</span>)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-xs font-bold ${u.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{u.ativo ? 'Ativa' : 'Inativa'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/usuarios/${u.id_usuario}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-brand-600 hover:text-brand-600">Editar</Link>
                        {podeEditar && (u.ativo ? (
                          <BotaoConfirmar rotulo="Inativar" pergunta="Inativar esta conta?" aoConfirmar={() => mudarStatus(u, false)} />
                        ) : (
                          <button type="button" onClick={() => mudarStatus(u, true)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-brand-600 hover:text-brand-600">Ativar</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EstadoVazio icone={Users} titulo="Nenhum usuário encontrado" descricao="Ajuste a busca ou os filtros." />
        )}
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={(p) => filtrar({}, p)} />
      </div>
    </div>
  )
}
