import { BarChart3, Package, ReceiptText, Tag, Tags, Users, type LucideIcon } from 'lucide-react'
import { PERMISSAO } from '../../lib/permissoes'

export interface SecaoAdmin {
  to: string
  rotulo: string
  descricao: string
  icone: LucideIcon
  permissao: string
}

export const SECOES: SecaoAdmin[] = [
  { to: '/admin/vendas', rotulo: 'Painel de vendas', descricao: 'Veja a receita, os pedidos por status e os produtos mais vendidos.', icone: BarChart3, permissao: PERMISSAO.dashboard },
  { to: '/admin/produtos', rotulo: 'Produtos', descricao: 'Cadastre, edite e inative os produtos da loja.', icone: Package, permissao: PERMISSAO.catalogo },
  { to: '/admin/categorias', rotulo: 'Categorias', descricao: 'Crie, renomeie, inative e exclua categorias.', icone: Tags, permissao: PERMISSAO.catalogo },
  { to: '/admin/marcas', rotulo: 'Marcas', descricao: 'Crie, renomeie, inative e exclua marcas.', icone: Tag, permissao: PERMISSAO.catalogo },
  { to: '/admin/usuarios', rotulo: 'Usuários', descricao: 'Veja as contas, edite os dados, ative ou inative e defina os cargos.', icone: Users, permissao: PERMISSAO.usuariosListar },
  { to: '/admin/pedidos', rotulo: 'Pedidos', descricao: 'Acompanhe os pedidos, atualize o andamento e cancele quando preciso.', icone: ReceiptText, permissao: PERMISSAO.pedidosListar },
]
