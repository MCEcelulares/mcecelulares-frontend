import { Link } from 'react-router-dom'
import { listarMarcas } from '../../lib/catalogo'
import { useConsulta } from '../../hooks/useConsulta'

export function MarcasStrip() {
  const { dados: marcas } = useConsulta(listarMarcas)
  if (!marcas || marcas.length === 0) return null

  return (
    <section className="pagina py-10">
      <h2 className="mb-6 text-center text-sm font-bold tracking-widest text-slate-500 uppercase">
        As melhores marcas estão na MCE
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-slate-200 bg-white px-6 py-6">
        {marcas.map(({ id_marca, nome }) => (
          <Link
            key={id_marca}
            to={`/produtos?marca=${id_marca}`}
            className="font-display text-2xl font-bold text-slate-400 transition hover:text-brand-600"
          >
            {nome}
          </Link>
        ))}
      </div>
    </section>
  )
}
