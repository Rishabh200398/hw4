// An illustrated New Haven scene celebrating the two schools behind this storefront's
// theme: the Yale School of Management (Evans Hall, glass + navy) and the Yale School of
// the Environment (Kroon Hall, timber + green). An original illustration, not a photo.
export default function YaleCampusArt() {
  return (
    <svg className="campus-art" viewBox="0 0 800 320" role="img"
      aria-label="Illustration of the Yale School of Management and Yale School of the Environment">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a4f94" />
          <stop offset="1" stopColor="#cfe3f3" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill="url(#sky)" />
      <circle cx="660" cy="70" r="34" fill="#f4c430" opacity="0.9" />
      {/* ground */}
      <rect y="250" width="800" height="70" fill="#2f8f5b" />
      <rect y="250" width="800" height="10" fill="#267a4c" />

      {/* SOM — Evans Hall: modern glass block, navy */}
      <g>
        <rect x="430" y="110" width="250" height="140" fill="#00366b" />
        <rect x="430" y="110" width="250" height="140" fill="none" stroke="#002448" strokeWidth="3" />
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 7 }).map((_, c) => (
            <rect key={`${r}-${c}`} x={445 + c * 33} y={125 + r * 24} width="22" height="16" fill="#9ec7ea" opacity="0.85" />
          )),
        )}
        <rect x="430" y="104" width="250" height="8" fill="#f04f36" />
      </g>

      {/* YSE — Kroon Hall: pitched timber building, green */}
      <g>
        <polygon points="120,120 260,120 230,150 150,150" fill="#8a5a2b" />
        <rect x="150" y="150" width="80" height="100" fill="#b07c45" />
        <rect x="150" y="150" width="80" height="100" fill="none" stroke="#6b4a2a" strokeWidth="3" />
        {Array.from({ length: 3 }).map((_, r) =>
          Array.from({ length: 2 }).map((_, c) => (
            <rect key={`y-${r}-${c}`} x={166 + c * 34} y={162 + r * 28} width="22" height="18" fill="#d8ecd8" />
          )),
        )}
        {/* solar / leaf accents for the environment school */}
        <rect x="150" y="116" width="80" height="6" fill="#2f8f5b" />
        <path d="M300 250 q0 -46 40 -58 q-6 44 -40 58 Z" fill="#2f8f5b" />
        <rect x="318" y="228" width="4" height="24" fill="#267a4c" />
      </g>

      {/* a little tree */}
      <rect x="392" y="214" width="8" height="38" fill="#6b4a2a" />
      <circle cx="396" cy="206" r="26" fill="#3aa06a" />

      {/* labels */}
      <text x="555" y="285" textAnchor="middle" fill="#fff" fontFamily="'Open Sans',sans-serif" fontWeight="700" fontSize="17">School of Management</text>
      <text x="190" y="285" textAnchor="middle" fill="#fff" fontFamily="'Open Sans',sans-serif" fontWeight="700" fontSize="17">School of the Environment</text>
    </svg>
  )
}
