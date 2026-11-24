import type { Perfil } from './auth'

/** Permissões do back-end (identidade-service/src/config/rbac.ts) que o painel administrativo usa. */
export const PERMISSAO = {
  painel: 'painel:acessar',
  dashboard: 'dashboard:ver',
  catalogo: 'catalogo:gerenciar',
  usuariosListar: 'usuarios:listar',
  usuariosEditar: 'usuarios:editar',
  usuariosCargos: 'usuarios:gerenciar-cargos',
  pedidosListar: 'pedidos:listar-todos',
  pedidosStatus: 'pedidos:atualizar-status',
  pedidosCancelar: 'pedidos:cancelar',
} as const

export const temPermissao = (usuario: Perfil | null | undefined, permissao: string) =>
  usuario?.permissoes.includes(permissao) ?? false
