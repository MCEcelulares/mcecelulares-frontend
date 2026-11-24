import { useState } from 'react'
import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { AlertaErro, AuthShell } from '../components/auth/AuthShell'
import { classeBotao } from '../components/ui/botao'
import { Campo, CampoTexto } from '../components/ui/Campo'
import { useAuth } from '../hooks/useAuth'
import { useFormulario } from '../hooks/useFormulario'
import { ASSUNTO_MAX, enviarContato, MENSAGEM_MAX } from '../lib/contato'
import { EMPRESA } from '../lib/empresa'
import { HORARIOS, situacaoAgora } from '../lib/horario'
import { mascararTelefone, soDigitos } from '../lib/mascaras'
import { emailValido, telefoneValido } from '../lib/validacao'

const ASSUNTOS = ['Dúvida sobre pedido', 'Troca ou devolução', 'Garantia', 'Pagamento', 'Entrega', 'Sugestão', 'Outro']

const cartao = 'cartao p-6'

function FormContato() {
  const { usuario } = useAuth()
  const [enviado, setEnviado] = useState(false)
  const { valores, setValores, erros, erroGeral, enviando, alterar, enviar } = useFormulario({
    inicial: {
      nome: usuario?.nome ?? '',
      email: usuario?.email ?? '',
      telefone: usuario?.telefone ? mascararTelefone(usuario.telefone) : '',
      pedido: '',
      assunto: '',
      mensagem: '',
    },
    validar: (v) => ({
      ...(v.nome.trim().length < 2 && { nome: 'Informe seu nome.' }),
      ...(!emailValido(v.email) && { email: 'Informe um e-mail válido.' }),
      ...(v.telefone && !telefoneValido(v.telefone) && { telefone: 'Informe um telefone com DDD.' }),
      ...(v.pedido && !/^#?\d{1,10}$/.test(v.pedido.trim()) && { pedido: 'Informe só o número do pedido (ex.: 123).' }),
      ...(v.mensagem.trim().length < 5 && { mensagem: 'Escreva uma mensagem com pelo menos 5 caracteres.' }),
    }),
    enviar: async (v) => {
      const pedido = soDigitos(v.pedido)
      await enviarContato({
        nome: v.nome.trim(),
        email: v.email.trim(),
        telefone: v.telefone || undefined,
        assunto: v.assunto.trim() || undefined,
        mensagem: (pedido ? `Pedido #${pedido}\n\n` : '') + v.mensagem.trim(),
      })
      setEnviado(true)
    },
    mensagemErro: (err) =>
      err.status === 400 || err.status === 429
        ? err.message
        : 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes ou fale com a gente pelo WhatsApp.',
    mensagemPadrao: 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes ou fale com a gente pelo WhatsApp.',
  })

  const numeroPedido = soDigitos(valores.pedido)
  const limiteMensagem = MENSAGEM_MAX - (numeroPedido ? `Pedido #${numeroPedido}\n\n`.length : 0)

  if (enviado) {
    return (
      <section className={`${cartao} flex flex-col items-center py-16 text-center md:p-10`} role="status">
        <CheckCircle2 size={56} className="text-success" />
        <h2 className="mt-4 font-display text-2xl font-bold">Mensagem enviada!</h2>
        <p className="mt-2 max-w-md text-slate-600">Recebemos sua mensagem e vamos responder no e-mail <strong>{valores.email}</strong>.</p>
        <button
          onClick={() => { setEnviado(false); setValores((v) => ({ ...v, pedido: '', assunto: '', mensagem: '' })) }}
          className={classeBotao('contorno', 'md', 'mt-6')}
        >
          Enviar outra mensagem
        </button>
      </section>
    )
  }

  return (
    <section className={`${cartao} md:p-8`}>
      <h2 className="font-display text-2xl font-bold">Envie uma Mensagem</h2>
      <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
        {erroGeral && <AlertaErro mensagem={erroGeral} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nome completo" name="nome" autoComplete="name" placeholder="Seu nome" value={valores.nome} onChange={(e) => alterar('nome', e.target.value)} erro={erros.nome} maxLength={100} />
          <Campo label="E-mail" name="email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={valores.email} onChange={(e) => alterar('email', e.target.value)} erro={erros.email} maxLength={255} />
          <Campo label="Telefone (opcional)" name="telefone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" value={valores.telefone} onChange={(e) => alterar('telefone', mascararTelefone(e.target.value))} erro={erros.telefone} />
          <Campo label="Número do pedido (opcional)" name="pedido" inputMode="numeric" autoComplete="off" placeholder="Ex.: 123" value={valores.pedido} onChange={(e) => alterar('pedido', e.target.value)} erro={erros.pedido} />
        </div>
        <Campo label="Assunto" name="assunto" list="assuntos" placeholder="Escolha ou digite o assunto..." value={valores.assunto} onChange={(e) => alterar('assunto', e.target.value)} erro={erros.assunto} maxLength={ASSUNTO_MAX} />
        <datalist id="assuntos">{ASSUNTOS.map((a) => <option key={a} value={a} />)}</datalist>
        <CampoTexto
          label="Mensagem"
          name="mensagem"
          rows={6}
          placeholder="Escreva detalhadamente como podemos te ajudar..."
          value={valores.mensagem}
          onChange={(e) => alterar('mensagem', e.target.value)}
          erro={erros.mensagem}
          dica={`${valores.mensagem.length}/${limiteMensagem}`}
          maxLength={limiteMensagem}
        />
        <button type="submit" disabled={enviando} className={classeBotao('primario', 'grande')}>
          {enviando ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </form>
    </section>
  )
}

function Atendimento() {
  const { dia, aberto } = situacaoAgora()
  const numero = soDigitos(EMPRESA.whatsappUrl)

  return (
    <div className="space-y-6">
      <section className={cartao}>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Phone size={22} /></span>
          <div>
            <h2 className="titulo-card">Atendimento por Telefone</h2>
            <a href={`tel:+${numero}`} className="font-semibold text-brand-600 hover:underline">{EMPRESA.telefone}</a>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock size={16} className="text-slate-500" /> Horário de atendimento</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${aberto ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
            {aberto ? 'Aberto agora' : 'Fechado agora'}
          </span>
        </div>
        <dl className="mt-3 divide-y divide-slate-100 text-sm">
          {HORARIOS.map((faixa) => (
            <div key={faixa.rotulo} className={`flex justify-between py-2 ${faixa.dias.includes(dia) ? 'font-semibold text-ink' : 'text-slate-600'}`}>
              <dt>{faixa.rotulo}</dt>
              <dd>{faixa.horas ? `${faixa.horas.abre} às ${faixa.horas.fecha}` : 'Fechado'}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-500">Em feriados o horário pode mudar.</p>

        <a
          href={EMPRESA.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-success py-3 font-semibold text-white transition hover:brightness-95"
        >
          <FaWhatsapp size={18} /> Chamar no WhatsApp
        </a>
      </section>

      <section className={`${cartao} flex items-start gap-4`}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Mail size={22} /></span>
        <div className="min-w-0">
          <h2 className="titulo-card">E-mail</h2>
          <a href={`mailto:${EMPRESA.emailSuporte}`} className="block font-semibold break-all text-emerald-600 hover:underline">{EMPRESA.emailSuporte}</a>
        </div>
      </section>

      <section className={`${cartao} flex items-start gap-4`}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><MapPin size={22} /></span>
        <div>
          <h2 className="titulo-card">Onde estamos</h2>
          <p className="text-sm text-slate-600">{EMPRESA.endereco}<br />{EMPRESA.cidade} · CEP {EMPRESA.cep}</p>
          <a href={EMPRESA.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">Ver no mapa</a>
        </div>
      </section>
    </div>
  )
}

export default function Contato() {
  const { usuario } = useAuth()

  return (
    <AuthShell
      titulo="Fale com a MCE"
      subtitulo="Estamos prontos para tirar suas dúvidas, ajudar com pedidos e receber sugestões."
      colunas="lg:grid-cols-[2fr_1fr]"
      card={<FormContato key={usuario?.id_usuario ?? 'visitante'} />}
      painel={<Atendimento />}
    />
  )
}
