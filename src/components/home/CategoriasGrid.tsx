import { Link } from 'react-router-dom'
import {
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  MonitorSmartphone,
  Mouse,
  Package,
  Smartphone,
  Tablet,
  Disc3,
  type LucideIcon,
} from 'lucide-react'
import { useCategorias } from '../../hooks/useCategorias'

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const ICONES: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  celulares: Smartphone,
  tablets: Tablet,
  notebooks: Laptop,
  consoles: Gamepad2,
  jogos: Disc3,
  monitores: Monitor,
  perifericos: Mouse,
  audio: Headphones,
  fones: Headphones,
  computadores: MonitorSmartphone,
}

export function CategoriasGrid() {
  const { categorias, carregando } = useCategorias()
  if (!carregando && categorias.length === 0) return null

  return (
    <section className="pagina py-10">
      <h2 className="mb-6 font-display text-3xl font-bold">Navegue por Categorias</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {carregando
          ? Array.from({ length: 8 }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />)
          : categorias.map(({ id_categoria, nome }) => {
              const Icone = ICONES[normalizar(nome)] ?? Package
              return (
                <Link
                  key={id_categoria}
                  to={`/produtos?categoria=${id_categoria}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-6 text-center transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icone size={26} />
                  </span>
                  <span className="text-sm font-semibold">{nome}</span>
                </Link>
              )
            })}
      </div>
    </section>
  )
}
