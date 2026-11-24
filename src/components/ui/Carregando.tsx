import { Loader2 } from 'lucide-react'

export function Carregando({ rotulo = 'Carregando', className = 'py-32' }: { rotulo?: string; className?: string }) {
  return (
    <div className={`flex justify-center text-brand-600 ${className}`} role="status" aria-label={rotulo}>
      <Loader2 size={36} className="animate-spin" />
    </div>
  )
}
