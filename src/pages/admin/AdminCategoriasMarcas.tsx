import { useState, type FormEvent } from 'react'
import { Plus, Tags } from 'lucide-react'
import { BotaoConfirmar } from '../../components/admin/BotaoConfirmar'
import { Aviso } from '../../components/ui/Aviso'
import { classeBotao } from '../../components/ui/botao'
import { Campo } from '../../components/ui/Campo'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { useConsulta } from '../../hooks/useConsulta'
import {
  atualizarCategoria,
  atualizarMarca,
  criarCategoria,
  criarMarca,
  excluirCategoria,
  excluirMarca,
  listarCategoriasAdmin,
  listarMarcasAdmin,
} from '../../lib/admin'
import { ApiError } from '../../lib/api'
import { esquecerCategorias } from '../../lib/catalogo'

interface Item {
  id: number
  nome: string
  ativo: boolean
}

/** O que muda entre categorias e marcas: os textos e as chamadas. A tela é a mesma. */
interface Config {
  titulo: string
  novo: string
  vazio: string
  listar: () => Promise<Item[]>
  criar: (nome: string) => Promise<unknown>
  renomear: (id: number, nome: string) => Promise<unknown>
  mudarAtivo: (id: number, ativo: boolean) => Promise<unknown>
  excluir: (id: number) => Promise<unknown>
}

// Definidas fora dos componentes: `useConsulta` precisa de uma função estável.
const CATEGORIAS: Config = {
  titulo: 'Categorias',
  novo: 'Nova categoria',
  vazio: 'Nenhuma categoria cadastrada.',
  listar: () => listarCategoriasAdmin().then((l) => l.map((c) => ({ id: c.id_categoria, nome: c.nome, ativo: c.ativo }))),
  criar: (nome) => criarCategoria({ nome, ativo: true }).finally(esquecerCategorias),
  renomear: (id, nome) => atualizarCategoria(id, { nome }).finally(esquecerCategorias),
  mudarAtivo: (id, ativo) => atualizarCategoria(id, { ativo }).finally(esquecerCategorias),
  excluir: (id) => excluirCategoria(id).finally(esquecerCategorias),
}

const MARCAS: Config = {
  titulo: 'Marcas',
  novo: 'Nova marca',
  vazio: 'Nenhuma marca cadastrada.',
  listar: () => listarMarcasAdmin().then((l) => l.map((m) => ({ id: m.id_marca, nome: m.nome, ativo: m.ativo }))),
  criar: (nome) => criarMarca({ nome, ativo: true }),
  renomear: (id, nome) => atualizarMarca(id, { nome }),
  mudarAtivo: (id, ativo) => atualizarMarca(id, { ativo }),
  excluir: (id) => excluirMarca(id),
}

const botaoLinha = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition hover:border-brand-600 hover:text-brand-600'

function CadastroSimples({ config }: { config: Config }) {
  const { dados, erro, carregando, recarregar } = useConsulta(config.listar)
  const [novoNome, setNovoNome] = useState('')
  const [erroNovo, setErroNovo] = useState<string | undefined>()
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [editando, setEditando] = useState<number | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')

  /** Roda a ação, mostra o erro da API (ex.: "há produtos ligados") e atualiza a lista. */
  const executar = async (acao: () => Promise<unknown>) => {
    setErroAcao(null)
    try {
      await acao()
      await recarregar()
      return true
    } catch (e) {
      setErroAcao(e instanceof ApiError ? e.message : 'Não foi possível concluir a ação. Tente novamente.')
      return false
    }
  }

  const adicionar = async (e: FormEvent) => {
    e.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return setErroNovo('Informe o nome.')
    setErroNovo(undefined)
    if (await executar(() => config.criar(nome))) setNovoNome('')
  }

  const salvarEdicao = async (item: Item) => {
    const nome = nomeEdicao.trim()
    if (!nome) return setErroAcao('Informe o nome.')
    if (await executar(() => config.renomear(item.id, nome))) setEditando(null)
  }

  return (
    <div>
      <h1 className="titulo-pagina">{config.titulo}</h1>

      <form onSubmit={adicionar} noValidate className="mt-6 flex flex-wrap items-start gap-3">
        <Campo label={config.novo} value={novoNome} onChange={(e) => { setNovoNome(e.target.value); setErroNovo(undefined) }} erro={erroNovo} maxLength={255} className="w-full sm:w-80" />
        <button type="submit" className={classeBotao('primario', 'sm', 'mt-[1.7rem] inline-flex items-center gap-2')}><Plus size={16} /> Adicionar</button>
      </form>

      {erroAcao && <Aviso tom="erro" className="mt-4">{erroAcao}</Aviso>}

      <div className="mt-6">
        {erro ? (
          <Aviso tom="erro">Não foi possível carregar a lista. {erro.message}</Aviso>
        ) : carregando ? (
          <Carregando />
        ) : dados && dados.length > 0 ? (
          <div className="cartao overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.map((item) => (
                  <tr key={item.id} className={item.ativo ? '' : 'bg-slate-50 text-slate-500'}>
                    <td className="px-4 py-3">
                      {editando === item.id ? (
                        <input
                          aria-label={`Nome de ${item.nome}`}
                          value={nomeEdicao}
                          onChange={(e) => setNomeEdicao(e.target.value)}
                          maxLength={255}
                          autoFocus
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{item.nome}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${item.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.ativo ? 'Ativa' : 'Inativa'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editando === item.id ? (
                          <>
                            <button type="button" onClick={() => salvarEdicao(item)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700">Salvar</button>
                            <button type="button" onClick={() => setEditando(null)} className={botaoLinha}>Cancelar</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => { setEditando(item.id); setNomeEdicao(item.nome); setErroAcao(null) }} className={botaoLinha}>Editar</button>
                            <button type="button" onClick={() => executar(() => config.mudarAtivo(item.id, !item.ativo))} className={botaoLinha}>{item.ativo ? 'Inativar' : 'Ativar'}</button>
                            <BotaoConfirmar rotulo="Excluir" pergunta={`Excluir "${item.nome}"?`} aoConfirmar={() => executar(() => config.excluir(item.id))} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EstadoVazio icone={Tags} titulo={config.vazio} descricao="Use o campo acima para cadastrar a primeira." />
        )}
      </div>
    </div>
  )
}

export const AdminCategorias = () => <CadastroSimples config={CATEGORIAS} />
export const AdminMarcas = () => <CadastroSimples config={MARCAS} />
