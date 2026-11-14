import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { classeBotao } from '../components/ui/botao'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
      <Compass size={52} className="text-slate-300" />
      <h1 className="mt-5 font-display text-4xl font-extrabold">Página não encontrada</h1>
      <p className="mt-2 text-slate-600">O endereço que você tentou abrir não existe ou ainda não está disponível.</p>
      <Link to="/" className={classeBotao('primario', 'md', 'mt-8')}>
        Voltar para a Home
      </Link>
    </div>
  )
}
