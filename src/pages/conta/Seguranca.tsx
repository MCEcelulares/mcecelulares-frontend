import { useState } from 'react'
import { AlertaErro } from '../../components/auth/AuthShell'
import { classeBotao } from '../../components/ui/botao'
import { CampoSenha } from '../../components/ui/Campo'
import { useAuth } from '../../hooks/useAuth'
import { useFormulario } from '../../hooks/useFormulario'
import { DICA_SENHA, erroDeSenha } from '../../lib/validacao'

const VAZIO = { atual: '', nova: '', confirmar: '' }

export default function Seguranca() {
  const { alterarSenha } = useAuth()
  const [sucesso, setSucesso] = useState(false)
  const { valores, setValores, erros, erroGeral, enviando, alterar, enviar } = useFormulario({
    inicial: VAZIO,
    validar: (v) => ({
      ...(!v.atual && { atual: 'Informe sua senha atual.' }),
      ...(erroDeSenha(v.nova)
        ? { nova: erroDeSenha(v.nova)! }
        : v.nova === v.atual && { nova: 'A nova senha deve ser diferente da atual.' }),
      ...(v.confirmar !== v.nova && { confirmar: 'As senhas não coincidem.' }),
    }),
    enviar: async (v) => {
      await alterarSenha(v.atual, v.nova)
      setValores(VAZIO)
      setSucesso(true)
    },
    errosExtras: (err) => {
      const nova = err.detalhes?.fieldErrors?.novaSenha?.[0]
      return err.status === 401 ? { atual: err.message } : nova ? { nova } : {}
    },
    mensagemPadrao: 'Não foi possível alterar a senha. Tente novamente.',
    aoMudar: () => setSucesso(false),
  })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="titulo-pagina">Segurança e Senha</h1>
        <p className="mt-2 text-slate-600">Troque sua senha. Por segurança, os outros dispositivos serão desconectados.</p>
      </header>

      <section className="max-w-xl cartao p-6 md:p-8">
        <h2 className="titulo-secao">Alterar senha</h2>
        <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
          {erroGeral && <AlertaErro mensagem={erroGeral} />}
          {sucesso && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Senha alterada com sucesso.</p>}
          <CampoSenha label="Senha atual" name="atual" autoComplete="current-password" value={valores.atual} onChange={(e) => alterar('atual', e.target.value)} erro={erros.atual} />
          <CampoSenha label="Nova senha" name="nova" autoComplete="new-password" value={valores.nova} onChange={(e) => alterar('nova', e.target.value)} erro={erros.nova} dica={DICA_SENHA} />
          <CampoSenha label="Confirmar nova senha" name="confirmar" autoComplete="new-password" value={valores.confirmar} onChange={(e) => alterar('confirmar', e.target.value)} erro={erros.confirmar} />
          <button type="submit" disabled={enviando} className={classeBotao('primario', 'formulario', 'sm:w-auto sm:px-8')}>
            {enviando ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </section>
    </div>
  )
}
