export type DicaRetorno = 'aprovado' | 'pendente' | 'recusado' | 'desconhecida'

export interface RetornoMercadoPago {
  dica: DicaRetorno
  idPagamento: string | null
}

const DICAS = new Map<string, DicaRetorno>([
  ['approved', 'aprovado'],
  ['authorized', 'pendente'],
  ['pending', 'pendente'],
  ['in_process', 'pendente'],
  ['in_mediation', 'pendente'],
  ['rejected', 'recusado'],
  ['cancelled', 'recusado'],
])

export function lerRetornoMercadoPago(parametros: URLSearchParams): RetornoMercadoPago {
  const status = (parametros.get('status') ?? parametros.get('collection_status') ?? '').trim().toLowerCase()
  const id = parametros.get('payment_id') ?? parametros.get('collection_id')

  return {
    dica: DICAS.get(status) ?? 'desconhecida',
    idPagamento: id && /^\d+$/.test(id) ? id : null,
  }
}
