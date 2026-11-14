import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icone: LucideIcon
  titulo: string
  descricao?: ReactNode
  /** Botões ou links de ação, abaixo do texto. */
  children?: ReactNode
  /** Com cartão pontilhado ao redor (padrão) ou como texto solto no centro da página. */
  moldura?: boolean
  /** 1 quando o título é o principal da página. */
  nivel?: 1 | 2
  role?: 'alert' | 'status'
  className?: string
}

/** Tela de "nada por aqui": lista vazia, item não encontrado ou erro de carregamento. */
export function EstadoVazio({ icone: Icone, titulo, descricao, children, moldura = true, nivel = 2, role, className = '' }: Props) {
  const Titulo = nivel === 1 ? 'h1' : 'h2'
  const caixa = moldura ? 'rounded-3xl border border-dashed border-slate-300 bg-white' : 'mx-auto max-w-xl'

  return (
    <div role={role} className={`flex flex-col items-center px-6 py-20 text-center ${caixa} ${className}`}>
      <Icone size={48} className="text-slate-300" />
      <Titulo className="mt-4 font-display text-2xl font-bold">{titulo}</Titulo>
      {descricao && <p className="mt-1 text-slate-500">{descricao}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}
