import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="MCE Celulares, página inicial">
      <img
        src="/img/logo-mcecelulares-roxo.png"
        alt="MCE Celulares"
        width={1365}
        height={503}
        className="h-11 w-auto md:h-14"
      />
    </Link>
  )
}
