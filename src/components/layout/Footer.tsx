import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6'
import { ANO_ATUAL, EMPRESA } from '../../lib/empresa'

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/carrinho', label: 'Carrinho' },
  { to: '/pedidos', label: 'Meus Pedidos' },
  { to: '/contato', label: 'Contato' },
]

export function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <img src="/img/logo-mcecelulares.png" alt={EMPRESA.nome} className="h-14 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            Smartphones, tablets, notebooks, consoles e acessórios com atendimento próximo, direto de Corbélia para todo o Brasil.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={EMPRESA.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand-600"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href={EMPRESA.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand-600"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Navegue</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="transition hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-white">Atendimento</h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a href={EMPRESA.mapsUrl} target="_blank" rel="noreferrer" className="flex gap-3 transition hover:text-white">
                <MapPin size={18} className="mt-0.5 shrink-0 text-brand-100" />
                <span>
                  {EMPRESA.endereco}
                  <br />
                  {EMPRESA.cidade} · CEP {EMPRESA.cep}
                </span>
              </a>
            </li>
            <li>
              <a href={EMPRESA.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition hover:text-white">
                <Phone size={18} className="shrink-0 text-brand-100" />
                {EMPRESA.telefone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="pagina py-5 text-xs text-slate-500">
          © {ANO_ATUAL} {EMPRESA.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
