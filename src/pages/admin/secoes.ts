import { Package, type LucideIcon } from 'lucide-react'
import { PERMISSAO } from '../../lib/permissoes'

export interface SecaoAdmin {
  to: string
  rotulo: string
  descricao: string
  icone: LucideIcon
  /** Permissão do back-end necessária para ver a seção (menu e rota). */
  permissao: string
}

/** Seções do painel, na ordem do menu. Cada tela do painel acrescenta a sua aqui. */
export const SECOES: SecaoAdmin[] = [
  { to: '/admin/produtos', rotulo: 'Produtos', descricao: 'Cadastre, edite e inative os produtos da loja.', icone: Package, permissao: PERMISSAO.catalogo },
]
