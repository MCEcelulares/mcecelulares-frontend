import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { AlertaErro } from '../../components/auth/AuthShell'
import { FormEndereco } from '../../components/checkout/FormEndereco'
import { classeBotao } from '../../components/ui/botao'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { useAuth } from '../../hooks/useAuth'
import { useConsulta } from '../../hooks/useConsulta'
import { ApiError } from '../../lib/api'
import { formatarCep, linhaCidade, linhaRua, listarEnderecos, marcarEnderecoPrincipal, removerEndereco, type Endereco } from '../../lib/enderecos'

type Modo = { tipo: 'lista' } | { tipo: 'novo' } | { tipo: 'editar'; id: number } | { tipo: 'excluir'; id: number }

export default function EnderecosConta() {
  const { usuario } = useAuth()
  const idUsuario = usuario!.id_usuario // a rota é protegida
  const { dados: enderecos, carregando, erro: erroCarga, recarregar } = useConsulta(listarEnderecos, idUsuario)
  const [modo, setModo] = useState<Modo>({ tipo: 'lista' })
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const executar = async (id: number, acao: () => Promise<unknown>) => {
    setErro(null)
    setOcupado(id)
    try {
      await acao()
      await recarregar()
      setModo({ tipo: 'lista' })
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível concluir a ação. Tente novamente.')
    } finally {
      setOcupado(null)
    }
  }

  const aoSalvar = async () => {
    await recarregar()
    setModo({ tipo: 'lista' })
  }

  const lista = enderecos ?? []

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="titulo-pagina">Endereços Cadastrados</h1>
          <p className="mt-2 text-slate-600">Escolha onde quer receber seus pedidos.</p>
        </div>
        {modo.tipo !== 'novo' && !carregando && (
          <button onClick={() => { setErro(null); setModo({ tipo: 'novo' }) }} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
            <Plus size={16} /> Adicionar Novo Endereço
          </button>
        )}
      </header>

      {erro && <AlertaErro mensagem={erro} />}
      {erroCarga && <AlertaErro mensagem="Não foi possível carregar seus endereços. Recarregue a página." />}

      {modo.tipo === 'novo' && (
        <section className="rounded-3xl border border-brand-100 bg-white p-6 md:p-8">
          <h2 className="mb-6 flex items-center gap-2 titulo-secao"><MapPin size={20} className="text-brand-600" /> Novo Endereço</h2>
          <FormEndereco idUsuario={idUsuario} onSalvo={aoSalvar} onCancelar={() => setModo({ tipo: 'lista' })} />
        </section>
      )}

      {carregando ? (
        <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}</div>
      ) : lista.length === 0 && modo.tipo !== 'novo' ? (
        <EstadoVazio icone={MapPin} titulo="Nenhum endereço cadastrado" descricao="Cadastre um endereço para agilizar suas compras.">
          <button onClick={() => setModo({ tipo: 'novo' })} className={classeBotao()}>Adicionar endereço</button>
        </EstadoVazio>
      ) : (
        <ul className="space-y-4">
          {lista.map((e: Endereco) => {
            const editando = modo.tipo === 'editar' && modo.id === e.id_endereco
            const excluindo = modo.tipo === 'excluir' && modo.id === e.id_endereco
            const bloqueado = ocupado === e.id_endereco

            if (editando) {
              return (
                <li key={e.id_endereco} className="rounded-3xl border border-brand-100 bg-white p-6 md:p-8">
                  <h2 className="mb-6 titulo-secao">Editar Endereço</h2>
                  <FormEndereco idUsuario={idUsuario} endereco={e} onSalvo={aoSalvar} onCancelar={() => setModo({ tipo: 'lista' })} />
                </li>
              )
            }

            return (
              <li key={e.id_endereco} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 text-sm">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{linhaRua(e)}</span>
                      {e.principal && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-600 uppercase">Padrão</span>}
                    </p>
                    <p className="mt-1 text-slate-600">{linhaCidade(e)}</p>
                    <p className="text-slate-500">CEP {formatarCep(e.cep)}</p>
                  </div>

                  {excluindo ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm" role="alertdialog" aria-label="Confirmar exclusão">
                      <span className="font-medium">Excluir este endereço?</span>
                      <button onClick={() => executar(e.id_endereco, () => removerEndereco(idUsuario, e.id_endereco))} disabled={bloqueado} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                        {bloqueado ? 'Excluindo...' : 'Sim, excluir'}
                      </button>
                      <button onClick={() => setModo({ tipo: 'lista' })} disabled={bloqueado} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                      {!e.principal && (
                        <button onClick={() => executar(e.id_endereco, () => marcarEnderecoPrincipal(idUsuario, e.id_endereco))} disabled={bloqueado} className="text-slate-600 hover:text-brand-600 disabled:opacity-50">
                          {bloqueado ? 'Salvando...' : 'Definir como padrão'}
                        </button>
                      )}
                      <button onClick={() => { setErro(null); setModo({ tipo: 'editar', id: e.id_endereco }) }} className="text-brand-600 hover:underline">Editar</button>
                      <button onClick={() => { setErro(null); setModo({ tipo: 'excluir', id: e.id_endereco }) }} className="text-red-600 hover:underline">Excluir</button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
