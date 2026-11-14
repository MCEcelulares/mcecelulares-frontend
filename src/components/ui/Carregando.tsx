import { Loader2 } from 'lucide-react'

/** Indicador de carregamento de página inteira. `className` troca o espaçamento vertical (padrão: py-32). */
export function Carregando({ rotulo = 'Carregando', className = 'py-32' }: { rotulo?: string; className?: string }) {
  return (
    <div className={`flex justify-center text-brand-600 ${className}`} role="status" aria-label={rotulo}>
      <Loader2 size={36} className="animate-spin" />
    </div>
  )
}
