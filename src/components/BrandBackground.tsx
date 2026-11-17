/**
 * Fundo da marca: noite azul profunda, brilho cobalto no topo, luz âmbar de vitrine na base
 * e duas faixas diagonais que ecoam o traço longo do X do logotipo Fixed.
 */
export function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* brilho cobalto no topo */}
      <div className="absolute left-1/2 top-[-18vmax] h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,101,255,0.45)_0%,rgba(0,101,255,0.12)_42%,transparent_70%)]" />
      {/* luz âmbar da vitrine, baixa e à direita */}
      <div className="absolute -bottom-[20vmax] -right-[16vmax] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(239,169,95,0.28)_0%,rgba(239,169,95,0.08)_45%,transparent_70%)]" />
      <div className="absolute -bottom-[22vmax] -left-[20vmax] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle,rgba(50,215,255,0.12)_0%,transparent_65%)]" />

      {/* faixas diagonais (gesto do X) */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="fx-stroke" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#32D7FF" stopOpacity="0" />
            <stop offset="0.45" stopColor="#32D7FF" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#0065FF" stopOpacity="0.45" />
            <stop offset="1" stopColor="#0065FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fx-band" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0065FF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#0065FF" stopOpacity="0.14" />
            <stop offset="1" stopColor="#0065FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M1120 -60 L1240 -60 L120 1080 L0 1080 Z" fill="url(#fx-band)" />
        <path d="M1180 -60 L60 1080" stroke="url(#fx-stroke)" strokeWidth="1.6" />
        <path d="M1260 40 L300 1100" stroke="url(#fx-stroke)" strokeWidth="0.8" opacity="0.6" />
      </svg>

      {/* grão sutil + vinheta */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(3,6,12,0.7)_100%)]" />
      {/* reflexo do pavimento */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#efa95f]/[0.06] to-transparent" />
    </div>
  );
}
