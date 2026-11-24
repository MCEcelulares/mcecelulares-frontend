import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { atualizarStatusPedido, PODE_CANCELAR, PROXIMO_STATUS } from '../../lib/admin'
import { ApiError } from '../../lib/api'
import { PERMISSAO, temPermissao } from '../../lib/permissoes'
import type { StatusPedido } from '../../lib/pedidos'
import { BotaoConfirmar } from './BotaoConfirmar'

interface Props {
  idPedido: number
  status: StatusPedido
  /** Chamado depois de mudar o status, para a tela buscar os dados de novo. */
  aoMudar: () => Promise<unknown>
}

/** Botões de status só para as transições permitidas e só para quem tem a permissão; o back-end confere de novo. */
export function AcoesDoPedido({ idPedido, status, aoMudar }: Props) {
  const { usuario } = useAuth()
  const [erro, setErro] = useState<string | null>(null)
  const proximo = temPermissao(usuario, PERMISSAO.pedidosStatus) ? PROXIMO_STATUS[status] : undefined
  const cancelavel = temPermissao(usuario, PERMISSAO.pedidosCancelar) && PODE_CANCELAR.includes(status)

  const mudar = async (novo: StatusPedido) => {
    setErro(null)
    try {
      await atualizarStatusPedido(idPedido, novo)
      await aoMudar()
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível alterar o pedido. Tente novamente.')
    }
  }

  if (!proximo && !cancelavel) return null

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {proximo && <BotaoConfirmar rotulo={proximo.rotulo} pergunta={proximo.pergunta} tom="neutro" aoConfirmar={() => mudar(proximo.status)} />}
        {cancelavel && <BotaoConfirmar rotulo="Cancelar pedido" pergunta="Cancelar este pedido?" aoConfirmar={() => mudar('CANCELADO')} />}
      </div>
      {erro && <p role="alert" className="max-w-xs text-right text-xs text-red-600">{erro}</p>}
    </div>
  )
}
