import { Navigate, useLocation } from 'react-router-dom'
import { Check, MapPin, PackageSearch, Sparkles, Zap } from 'lucide-react'
import { AlertaErro, AuthShell, CardFormulario, PainelBeneficios } from '../components/auth/AuthShell'
import { classeBotao } from '../components/ui/botao'
import { Campo, CampoSenha } from '../components/ui/Campo'
import { useAuth } from '../hooks/useAuth'
import { useFormulario, type Erros } from '../hooks/useFormulario'
import { mascararCpf, mascararTelefone } from '../lib/mascaras'
import { cpfValido, DICA_SENHA, emailValido, erroDeSenha, telefoneValido } from '../lib/validacao'


const VAZIO = { nome: '', cpf: '', telefone: '', email: '', senha: '', confirmar: '' }

function validar(v: typeof VAZIO): Erros<typeof VAZIO> {
  const erros: Erros<typeof VAZIO> = {}
  if (v.nome.trim().length < 2) erros.nome = 'Informe seu nome completo.'
  if (!cpfValido(v.cpf)) erros.cpf = 'CPF inválido.'
  if (!telefoneValido(v.telefone)) erros.telefone = 'Informe um telefone com DDD.'
  if (!emailValido(v.email)) erros.email = 'Informe um e-mail válido.'
  const erroSenha = erroDeSenha(v.senha)
  if (erroSenha) erros.senha = erroSenha
  if (v.confirmar !== v.senha) erros.confirmar = 'As senhas não coincidem.'
  return erros
}

export default function Cadastro() {
  const { usuario, cadastrar } = useAuth()
  const location = useLocation()
  const destino = (location.state as { from?: string } | null)?.from ?? '/'

  const { valores, erros, erroGeral, enviando, alterar, enviar } = useFormulario({
    inicial: VAZIO,
    validar,
    enviar: (v) => cadastrar({ nome: v.nome.trim(), email: v.email.trim(), senha: v.senha, cpf: v.cpf, telefone: v.telefone }),
    errosExtras: (err) => (err.status !== 409 ? {} : /cpf/i.test(err.message) ? { cpf: err.message } : { email: err.message }),
    mensagemPadrao: 'Não foi possível criar a conta. Tente novamente.',
    manterEnviando: true,
  })

  if (usuario) return <Navigate to={destino} replace />

  return (
    <AuthShell
      titulo="Crie sua conta MCE"
      subtitulo="Cadastre-se em poucos passos para comprar com rapidez e acompanhar seus pedidos."
      colunas="lg:grid-cols-[2fr_1fr]"
      card={
        <CardFormulario titulo="Seus dados de acesso" subtitulo="Preencha os campos abaixo. É rápido e simples.">
          <form onSubmit={enviar} noValidate className="space-y-8">
            {erroGeral && <AlertaErro mensagem={erroGeral} />}

            <section aria-labelledby="grupo-pessoais" className="space-y-5">
              <h3 id="grupo-pessoais" className="titulo-card">Dados pessoais</h3>
              <Campo label="Nome completo" name="nome" autoComplete="name" placeholder="Como aparece no seu documento" value={valores.nome} onChange={(e) => alterar('nome', e.target.value)} erro={erros.nome} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="CPF" name="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={valores.cpf} onChange={(e) => alterar('cpf', mascararCpf(e.target.value))} erro={erros.cpf} />
                <Campo label="Telefone celular" name="telefone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" value={valores.telefone} onChange={(e) => alterar('telefone', mascararTelefone(e.target.value))} erro={erros.telefone} />
              </div>
            </section>

            <section aria-labelledby="grupo-acesso" className="space-y-5 border-t border-slate-200 pt-8">
              <h3 id="grupo-acesso" className="titulo-card">E-mail e senha</h3>
              <Campo label="E-mail" name="email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={valores.email} onChange={(e) => alterar('email', e.target.value)} erro={erros.email} />
              <div className="grid gap-5 sm:grid-cols-2">
                <CampoSenha label="Senha" name="senha" autoComplete="new-password" placeholder="Crie uma senha forte" value={valores.senha} onChange={(e) => alterar('senha', e.target.value)} erro={erros.senha} dica={DICA_SENHA} />
                <CampoSenha label="Confirmar senha" name="confirmar" autoComplete="new-password" placeholder="Digite a senha novamente" value={valores.confirmar} onChange={(e) => alterar('confirmar', e.target.value)} erro={erros.confirmar} />
              </div>
            </section>

            <button
              type="submit"
              disabled={enviando}
              className={classeBotao('primario', 'formulario')}
            >
              {enviando ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>
        </CardFormulario>
      }
      painel={
        <PainelBeneficios
          icone={Sparkles}
          titulo="Sua tecnologia, do seu jeito"
          descricao="Com uma conta MCE, você reúne seus pedidos e endereços em um só lugar."
          itens={[
            { icone: PackageSearch, titulo: 'Acompanhe seus pedidos' },
            { icone: MapPin, titulo: 'Salve seus endereços' },
            { icone: Zap, titulo: 'Compre com checkout mais rápido' },
            { icone: Check, titulo: 'Cadastro gratuito' },
          ]}
          rodapeTitulo="Já possui cadastro?"
          rodapeDescricao="Entre com seu e-mail e senha para continuar."
          acaoTexto="Acessar minha conta"
          acaoLink="/login"
        />
      }
    />
  )
}
