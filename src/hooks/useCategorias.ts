import { listarCategorias } from '../lib/catalogo'
import { useConsulta } from './useConsulta'

export function useCategorias() {
  const { dados, carregando } = useConsulta(listarCategorias)
  return { categorias: dados ?? [], carregando }
}
