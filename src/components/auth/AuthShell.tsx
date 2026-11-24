import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Aviso } from '../ui/Aviso'
import { classeBotao } from '../ui/botao'

interface ShellProps {
  titulo: string
  subtitulo: string
  /** Proporção das colunas no desktop: card do formulário | painel lateral. */
  colunas?: string
  card: ReactNode
  painel: ReactNode
}

export function AuthShell({ titulo, subtitulo, colunas = 'lg:grid-cols-2', card, painel }: ShellProps) {
  return (
    <div className="pagina py-12">
      <header className="text-center">
        <h1 className="font-display text-4xl font-extrabold md:text-5xl">{titulo}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">{subtitulo}</p>
      </header>
      <div className={`mt-10 grid items-start gap-8 [&>*]:min-w-0 ${colunas}`}>
        {card}
        {painel}
      </div>
    </div>
  )
}

export function CardFormulario({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <section className="cartao p-8 shadow-sm md:p-10">
      <h2 className="font-display text-2xl font-bold">{titulo}</h2>
      <p className="mt-2 text-sm text-slate-600">{subtitulo}</p>
      <div className="mt-8">{children}</div>
    </section>
  )
}

interface PainelProps {
  icone: LucideIcon
  titulo: string
  descricao: string
  itens: { icone: LucideIcon; titulo: string; descricao?: string }[]
  rodapeTitulo?: string
  rodapeDescricao?: string
  acaoTexto: string
  acaoLink: string
}

export function PainelBeneficios({ icone: Icone, titulo, descricao, itens, rodapeTitulo, rodapeDescricao, acaoTexto, acaoLink }: PainelProps) {
  return (
    <aside className="rounded-3xl border border-brand-100 bg-brand-50 p-8 md:p-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
        <Icone size={26} />
      </span>
      <h2 className="mt-6 font-display text-2xl font-bold">{titulo}</h2>
      <p className="mt-2 text-slate-600">{descricao}</p>

      <ul className="mt-6 space-y-4">
        {itens.map(({ icone: IconeItem, titulo: t, descricao: d }) => (
          <li key={t} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
              <IconeItem size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold">{t}</span>
              {d && <span className="block text-sm text-slate-600">{d}</span>}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-brand-100 pt-6">
        {rodapeTitulo && <h3 className="titulo-card">{rodapeTitulo}</h3>}
        {rodapeDescricao && <p className="mt-1 text-sm text-slate-600">{rodapeDescricao}</p>}
        <Link
          to={acaoLink}
          className={classeBotao('contornoRoxo', 'largo', 'mt-4 block text-center')}
        >
          {acaoTexto}
        </Link>
      </div>
    </aside>
  )
}

/** Erro de formulário: o mesmo aviso do resto do site (`Aviso` no tom de erro). */
export const AlertaErro = ({ mensagem }: { mensagem: string }) => <Aviso tom="erro">{mensagem}</Aviso>
