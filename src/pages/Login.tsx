import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { MapPin, PackageSearch, UserPlus } from 'lucide-react'
import { AlertaErro, AuthShell, CardFormulario, PainelBeneficios } from '../components/auth/AuthShell'
import { classeBotao } from '../components/ui/botao'
import { Campo, CampoSenha } from '../components/ui/Campo'
import { useAuth } from '../hooks/useAuth'
import { useFormulario } from '../hooks/useFormulario'
import { emailValido } from '../lib/validacao'

export default function Login() {
  const { usuario, entrar } = useAuth()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from ?? '/'

  const [manter, setManter] = useState(true)
  const { valores, erros, erroGeral, enviando, alterar, enviar } = useFormulario({
    inicial: { email: '', senha: '' },
    validar: (v) => ({
      ...(!emailValido(v.email) && { email: 'Informe um e-mail válido.' }),
      ...(!v.senha && { senha: 'Informe sua senha.' }),
    }),
    enviar: (v) => entrar(v.email.trim(), v.senha, manter),
    mensagemPadrao: 'Não foi possível entrar. Tente novamente.',
    manterEnviando: true,
  })

  if (usuario) return <Navigate to={destino} replace />

  return (
    <AuthShell
      titulo="Acesse sua conta"
      subtitulo="Entre para acompanhar seus pedidos e aproveitar uma experiência feita para você."
      card={
        <CardFormulario titulo="Que bom ter você de volta!" subtitulo="Use seu e-mail e senha cadastrados para entrar na sua conta MCE.">
          <form onSubmit={enviar} noValidate className="space-y-5">
            {erroGeral && <AlertaErro mensagem={erroGeral} />}
            <Campo
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={valores.email}
              onChange={(e) => alterar('email', e.target.value)}
              erro={erros.email}
            />
            <CampoSenha
              label="Senha"
              name="senha"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={valores.senha}
              onChange={(e) => alterar('senha', e.target.value)}
              erro={erros.senha}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={manter} onChange={(e) => setManter(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              Manter conectado
            </label>
            <button
              type="submit"
              disabled={enviando}
              className={classeBotao('primario', 'formulario')}
            >
              {enviando ? 'Entrando...' : 'Entrar na minha conta'}
            </button>
          </form>
        </CardFormulario>
      }
      painel={
        <PainelBeneficios
          icone={UserPlus}
          titulo="Ainda não tem cadastro?"
          descricao="Crie sua conta gratuitamente e deixe suas compras de tecnologia mais simples."
          itens={[
            { icone: PackageSearch, titulo: 'Acompanhe seus pedidos', descricao: 'Veja cada etapa da compra direto na sua conta.' },
            { icone: MapPin, titulo: 'Compra mais rápida', descricao: 'Salve endereços e agilize seus próximos pedidos.' },
          ]}
          acaoTexto="Criar minha conta"
          acaoLink="/cadastro"
        />
      }
    />
  )
}
