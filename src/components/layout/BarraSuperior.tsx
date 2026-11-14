import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { EMPRESA } from '../../lib/empresa'

export function BarraSuperior() {
  const { usuario } = useAuth()

  return (
    <div className="bg-brand-600 text-xs text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {EMPRESA.cidade.replace('Centro, ', '')}
          </span>
          <a href={EMPRESA.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:opacity-80">
            <Phone size={14} /> {EMPRESA.telefone}
          </a>
        </div>
        <div className="flex items-center gap-5">
          {usuario && <Link to="/pedidos" className="hidden hover:opacity-80 sm:inline">Meus Pedidos</Link>}
          <Link to="/contato" className="hidden hover:opacity-80 sm:inline">Atendimento</Link>
          <a href={EMPRESA.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-80">
            <FaInstagram size={15} />
          </a>
          <a href={EMPRESA.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:opacity-80">
            <FaWhatsapp size={15} />
          </a>
        </div>
      </div>
    </div>
  )
}
