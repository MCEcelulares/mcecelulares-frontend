import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TomAviso = 'info' | 'sucesso' | 'atencao' | 'erro'

const TONS: Record<TomAviso, { icone: LucideIcon; classe: string; role: 'status' | 'alert' }> = {
  info: { icone: Info, classe: 'border-sky-200 bg-sky-50 text-sky-800', role: 'status' },
  sucesso: { icone: CheckCircle2, classe: 'border-green-200 bg-green-50 text-green-800', role: 'status' },
  atencao: { icone: AlertTriangle, classe: 'border-amber-200 bg-amber-50 text-amber-800', role: 'status' },
  erro: { icone: XCircle, classe: 'border-red-200 bg-red-50 text-red-700', role: 'alert' },
}

interface Props {
  tom?: TomAviso
  /** Troca o ícone do tom (ex.: relógio para um prazo). */
  icone?: LucideIcon
  titulo?: string
  children: ReactNode
  className?: string
}

/** Faixa de aviso em linha: informa, alerta ou reporta um erro sem tirar o cliente da página. */
export function Aviso({ tom = 'info', icone, titulo, children, className = '' }: Props) {
  const { icone: IconePadrao, classe, role } = TONS[tom]
  const Icone = icone ?? IconePadrao

  return (
    <div role={role} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${classe} ${className}`}>
      <Icone size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
