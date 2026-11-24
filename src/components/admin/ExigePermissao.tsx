import { Link, Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { temPermissao } from '../../lib/permissoes'
import { classeBotao } from '../ui/botao'
import { EstadoVazio } from '../ui/EstadoVazio'

export function ExigePermissao({ permissao }: { permissao: string }) {
  const { usuario } = useAuth()

  if (!temPermissao(usuario, permissao)) {
    return (
      <EstadoVazio
        moldura={false}
        nivel={1}
        role="alert"
        icone={ShieldAlert}
        titulo="Acesso negado"
        descricao="Esta área é restrita à administração da loja. Fale com um administrador se você precisa dela."
      >
        <Link to="/" className={classeBotao()}>Voltar à loja</Link>
      </EstadoVazio>
    )
  }

  return <Outlet />
}
