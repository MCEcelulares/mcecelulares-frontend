import { STATUS_INFO, type StatusPedido } from '../../lib/pedidos'

export function StatusBadge({ status }: { status: StatusPedido }) {
  const { rotulo, classe } = STATUS_INFO[status]
  return <span className={`rounded-md px-3 py-1 text-xs font-bold tracking-wide uppercase ${classe}`}>{rotulo}</span>
}
