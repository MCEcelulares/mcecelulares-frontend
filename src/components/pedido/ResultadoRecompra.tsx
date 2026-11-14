import { Link } from 'react-router-dom'
import type { ResumoRecompra } from '../../hooks/useComprarNovamente'

export function ResultadoRecompra({ resultado }: { resultado: ResumoRecompra }) {
  const { adicionados, falhas } = resultado

  return (
    <div role="status" className="mt-4 space-y-2 text-sm">
      {adicionados > 0 && (
        <p className="font-medium text-success">
          {adicionados === 1 ? '1 item adicionado' : `${adicionados} itens adicionados`} ao carrinho.{' '}
          <Link to="/carrinho" className="font-semibold text-brand-600 underline">Ver carrinho</Link>
        </p>
      )}
      {falhas.length > 0 && (
        <ul className="list-inside list-disc rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
          {falhas.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
    </div>
  )
}
