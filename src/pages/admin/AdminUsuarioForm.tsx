import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UserX } from 'lucide-react'
import { BotaoConfirmar } from '../../components/admin/BotaoConfirmar'
import { Aviso } from '../../components/ui/Aviso'
import { classeBotao } from '../../components/ui/botao'
import { Campo } from '../../components/ui/Campo'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { useAuth } from '../../hooks/useAuth'
import { useConsulta } from '../../hooks/useConsulta'
import { type Erros, useFormulario } from '../../hooks/useFormulario'
import { alterarStatusUsuario, atualizarUsuario, buscarUsuario, definirCargos, listarCargos } from '../../lib/admin'
import { mensagemDe, statusDe } from '../../lib/api'
import type { Perfil } from '../../lib/auth'
import { mascararCpf, mascararTelefone } from '../../lib/mascaras'
import { PERMISSAO, temPermissao } from '../../lib/permissoes'
import { cpfValido, emailValido, telefoneValido } from '../../lib/validacao'

type Valores = { nome: string; email: string; cpf: string; telefone: string }

function DadosDoUsuario({ perfil, aoSalvar }: { perfil: Perfil; aoSalvar: () => Promise<unknown> }) {
  const [salvo, setSalvo] = useState(false)
  const { valores, erros, erroGeral, enviando, alterar, enviar } = useFormulario<Valores>({
    inicial: () => ({
      nome: perfil.nome,
      email: perfil.email,
      cpf: perfil.cpf ? mascararCpf(perfil.cpf) : '',
      telefone: perfil.telefone ? mascararTelefone(perfil.telefone) : '',
    }),
    validar: (v): Erros<Valores> => ({
      ...(v.nome.trim().length < 2 && { nome: 'Informe o nome completo.' }),
      ...(!emailValido(v.email) && { email: 'E-mail inválido.' }),
      ...(v.cpf.trim() && !cpfValido(v.cpf) && { cpf: 'CPF inválido.' }),
      ...(v.telefone.trim() && !telefoneValido(v.telefone) && { telefone: 'Informe um telefone com DDD.' }),
    }),
    enviar: async (v) => {
      await atualizarUsuario(perfil.id_usuario, {
        nome: v.nome.trim(),
        email: v.email.trim(),
        ...(v.cpf.trim() && { cpf: v.cpf }),
        ...(v.telefone.trim() && { telefone: v.telefone }),
      })
      await aoSalvar()
      setSalvo(true)
    },
    errosExtras: (err) => {
      if (err.status !== 409) return {}
      return /cpf/i.test(err.message) ? { cpf: err.message } : { email: err.message }
    },
    mensagemPadrao: 'Não foi possível salvar. Tente novamente.',
    aoMudar: () => setSalvo(false),
  })

  return (
    <form onSubmit={enviar} noValidate className="cartao grid gap-5 p-6 sm:grid-cols-2" aria-labelledby="titulo-dados">
      <h2 id="titulo-dados" className="titulo-card sm:col-span-2">Dados</h2>
      {erroGeral && <Aviso tom="erro" className="sm:col-span-2">{erroGeral}</Aviso>}
      {salvo && <Aviso tom="sucesso" className="sm:col-span-2">Dados salvos.</Aviso>}
      <Campo label="Nome" name="nome" value={valores.nome} onChange={(e) => alterar('nome', e.target.value)} erro={erros.nome} className="sm:col-span-2" />
      <Campo label="E-mail" name="email" type="email" value={valores.email} onChange={(e) => alterar('email', e.target.value)} erro={erros.email} className="sm:col-span-2" />
      <Campo label="CPF" name="cpf" inputMode="numeric" value={valores.cpf} onChange={(e) => alterar('cpf', mascararCpf(e.target.value))} erro={erros.cpf} placeholder="000.000.000-00" />
      <Campo label="Telefone" name="telefone" inputMode="tel" value={valores.telefone} onChange={(e) => alterar('telefone', mascararTelefone(e.target.value))} erro={erros.telefone} placeholder="(00) 00000-0000" />
      <div className="sm:col-span-2">
        <button type="submit" disabled={enviando} className={classeBotao('primario', 'sm')}>{enviando ? 'Salvando...' : 'Salvar dados'}</button>
      </div>
    </form>
  )
}

function SituacaoDaConta({ perfil, aoMudar }: { perfil: Perfil; aoMudar: () => Promise<unknown> }) {
  const [erro, setErro] = useState<string | null>(null)

  const mudar = async (ativo: boolean) => {
    setErro(null)
    try {
      await alterarStatusUsuario(perfil.id_usuario, ativo)
      await aoMudar()
    } catch (e) {
      setErro(mensagemDe(e, 'Não foi possível alterar a conta. Tente novamente.'))
    }
  }

  return (
    <section className="cartao p-6" aria-labelledby="titulo-situacao">
      <h2 id="titulo-situacao" className="titulo-card">Situação da conta</h2>
      <p className="mt-2 text-sm text-slate-600">
        {perfil.ativo ? 'A conta está ativa e pode entrar na loja.' : 'A conta está inativa: não consegue entrar e as sessões abertas foram encerradas.'}
      </p>
      {erro && <Aviso tom="erro" className="mt-3">{erro}</Aviso>}
      <div className="mt-4">
        {perfil.ativo ? (
          <BotaoConfirmar rotulo="Inativar conta" pergunta="Inativar esta conta?" aoConfirmar={() => mudar(false)} />
        ) : (
          <button type="button" onClick={() => mudar(true)} className={classeBotao('contorno', 'sm')}>Ativar conta</button>
        )}
      </div>
    </section>
  )
}

function CargosDoUsuario({ perfil, aoSalvar }: { perfil: Perfil; aoSalvar: () => Promise<unknown> }) {
  const { dados: cargos, erro: erroCargos, carregando } = useConsulta(listarCargos)
  const [escolhidos, setEscolhidos] = useState<string[]>(perfil.cargos)
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const alternar = (nome: string, marcado: boolean) => {
    setSalvo(false)
    setErro(null)
    setEscolhidos((atuais) => (marcado ? [...atuais, nome] : atuais.filter((c) => c !== nome)))
  }

  const salvar = async () => {
    if (escolhidos.length === 0) return setErro('Escolha pelo menos um cargo.')
    setEnviando(true)
    try {
      await definirCargos(perfil.id_usuario, escolhidos)
      await aoSalvar()
      setSalvo(true)
    } catch (e) {
      setErro(mensagemDe(e, 'Não foi possível salvar os cargos. Tente novamente.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="cartao p-6" aria-labelledby="titulo-cargos">
      <h2 id="titulo-cargos" className="titulo-card">Cargos</h2>
      <p className="mt-2 text-sm text-slate-600">Os cargos definem o que a pessoa pode fazer. A mudança vale no próximo login dela.</p>
      <div className="mt-4 space-y-3">
        {carregando ? (
          <Carregando />
        ) : erroCargos ? (
          <Aviso tom="erro">Não foi possível carregar os cargos. {erroCargos.message}</Aviso>
        ) : (
          <fieldset className="space-y-2">
            <legend className="sr-only">Cargos do usuário</legend>
            {(cargos ?? []).map((c) => (
              <label key={c.id_cargo} className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="cargo" value={c.nome} checked={escolhidos.includes(c.nome)} onChange={(e) => alternar(c.nome, e.target.checked)} className="h-4 w-4 accent-brand-600" />
                {c.nome}
              </label>
            ))}
          </fieldset>
        )}
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        {salvo && <Aviso tom="sucesso">Cargos salvos.</Aviso>}
        <button type="button" onClick={salvar} disabled={enviando || carregando} className={classeBotao('primario', 'sm')}>{enviando ? 'Salvando...' : 'Salvar cargos'}</button>
      </div>
    </section>
  )
}

function EditarUsuario({ id }: { id: string }) {
  const { usuario } = useAuth()
  const { dados, erro, carregando, recarregar } = useConsulta(buscarUsuario, id)

  if (carregando) return <Carregando />
  if (erro || !dados) {
    const naoExiste = [400, 404].includes(statusDe(erro))
    return (
      <EstadoVazio moldura={false} nivel={1} role="alert" icone={UserX} titulo={naoExiste ? 'Usuário não encontrado' : 'Não foi possível carregar o usuário'} descricao={naoExiste ? 'Ele não existe ou o endereço está errado.' : erro?.message}>
        <Link to="/admin/usuarios" className={classeBotao()}>Voltar aos usuários</Link>
      </EstadoVazio>
    )
  }

  return (
    <div>
      <Link to="/admin/usuarios" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"><ArrowLeft size={16} /> Usuários</Link>
      <h1 className="titulo-pagina mt-3">{dados.nome}</h1>
      <p className="mt-1 text-sm text-slate-500">Usuário #{dados.id_usuario} · {dados.email}</p>

      <div className="mt-6 space-y-6">
        {temPermissao(usuario, PERMISSAO.usuariosEditar) && <DadosDoUsuario key={dados.id_usuario} perfil={dados} aoSalvar={recarregar} />}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {temPermissao(usuario, PERMISSAO.usuariosEditar) && <SituacaoDaConta perfil={dados} aoMudar={recarregar} />}
          {temPermissao(usuario, PERMISSAO.usuariosCargos) && <CargosDoUsuario perfil={dados} aoSalvar={recarregar} />}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsuarioForm() {
  const { id = '' } = useParams()
  return <EditarUsuario id={id} />
}
