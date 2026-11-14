import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertaErro } from '../../components/auth/AuthShell'
import { classeBotao } from '../../components/ui/botao'
import { Campo } from '../../components/ui/Campo'
import { useAuth } from '../../hooks/useAuth'
import { useConsulta } from '../../hooks/useConsulta'
import { useFormulario } from '../../hooks/useFormulario'
import { formatarCep, linhaCidade, linhaRua, listarEnderecos } from '../../lib/enderecos'
import { mascararCpf, mascararTelefone, soDigitos } from '../../lib/mascaras'
import { cpfValido, telefoneValido } from '../../lib/validacao'


function EnderecoPrincipal({ idUsuario }: { idUsuario: number }) {
  const { dados: enderecos, carregando } = useConsulta(listarEnderecos, idUsuario)
  const principal = enderecos?.find((e) => e.principal) ?? enderecos?.[0]

  return (
    <section className="cartao p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="titulo-secao">Endereço de Entrega Principal</h2>
        <Link to="/conta/enderecos" className="text-sm font-semibold text-brand-600 hover:underline">
          {principal ? 'Gerenciar endereços' : 'Adicionar endereço +'}
        </Link>
      </div>
      <div className="mt-5">
        {carregando ? (
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        ) : principal ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold">{linhaRua(principal)}</p>
            <p className="text-slate-600">{linhaCidade(principal)}</p>
            <p className="text-slate-500">CEP {formatarCep(principal.cep)}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Você ainda não cadastrou nenhum endereço.</p>
        )}
      </div>
    </section>
  )
}

export default function DadosConta() {
  const { usuario, atualizarPerfil } = useAuth()
  const perfil = usuario! // a rota é protegida

  const inicial = {
    nome: perfil.nome,
    cpf: perfil.cpf ? mascararCpf(perfil.cpf) : '',
    telefone: perfil.telefone ? mascararTelefone(perfil.telefone) : '',
  }
  const [salvo, setSalvo] = useState(false)
  const { valores, erros, erroGeral, enviando, alterar, enviar } = useFormulario({
    inicial,
    validar: (v) => ({
      ...(v.nome.trim().length < 2 && { nome: 'Informe seu nome completo.' }),
      ...(!cpfValido(v.cpf) && { cpf: 'CPF inválido.' }),
      ...(!telefoneValido(v.telefone) && { telefone: 'Informe um telefone com DDD.' }),
    }),
    enviar: async (v) => {
      await atualizarPerfil({ nome: v.nome.trim(), cpf: v.cpf, telefone: v.telefone })
      setSalvo(true)
    },
    errosExtras: (err) => (err.status === 409 && /cpf/i.test(err.message) ? { cpf: err.message } : {}),
    mensagemPadrao: 'Não foi possível salvar. Tente novamente.',
    aoMudar: () => setSalvo(false),
  })

  const alterado =
    valores.nome.trim() !== inicial.nome || soDigitos(valores.cpf) !== soDigitos(inicial.cpf) || soDigitos(valores.telefone) !== soDigitos(inicial.telefone)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="titulo-pagina">Dados da Conta</h1>
        <p className="mt-2 text-slate-600">Gerencie suas informações pessoais e endereços.</p>
      </header>

      <section className="cartao p-6 md:p-8">
        <h2 className="titulo-secao">Dados Pessoais</h2>
        <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
          {erroGeral && <AlertaErro mensagem={erroGeral} />}
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo label="Nome completo" name="nome" autoComplete="name" value={valores.nome} onChange={(e) => alterar('nome', e.target.value)} erro={erros.nome} />
            <Campo label="CPF" name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={valores.cpf} onChange={(e) => alterar('cpf', mascararCpf(e.target.value))} erro={erros.cpf} />
            <Campo label="E-mail" name="email" type="email" value={perfil.email} readOnly disabled dica="O e-mail não pode ser alterado por aqui." />
            <Campo label="Telefone celular" name="telefone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" value={valores.telefone} onChange={(e) => alterar('telefone', mascararTelefone(e.target.value))} erro={erros.telefone} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            {salvo && <p role="status" className="text-sm font-medium text-success">Dados atualizados com sucesso.</p>}
            <button
              type="submit"
              disabled={enviando || !alterado}
              className={classeBotao('primario', 'md', 'text-sm')}
            >
              {enviando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </section>

      <EnderecoPrincipal idUsuario={perfil.id_usuario} />
    </div>
  )
}
