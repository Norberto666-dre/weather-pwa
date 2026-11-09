import { formatWind, windDirection } from "@/lib/format";
import { WindIcon } from "./icons";

const CARDINALS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

export default function WindCompass({ speed, gust, deg }) {
  const direction = windDirection(deg);
  const rotation = Number.isFinite(deg) ? deg : 0;

  return (
    <article className="panel instrument p-4">
      <header className="flex items-center justify-between gap-2">
        <p className="label">Viento</p>
        <WindIcon className="h-4 w-4 text-gold" />
      </header>

      <div className="mt-2 flex items-center gap-3">
        <svg
          viewBox="0 0 160 160"
          role="img"
          aria-label={`Viento de ${formatWind(speed)} desde el ${direction}.`}
          className="h-28 w-28 shrink-0"
        >
          <circle
            cx="80"
            cy="80"
            r="66"
            fill="var(--ink)"
            fillOpacity="0.35"
            stroke="var(--accent)"
            strokeOpacity="0.22"
          />
          <circle
            cx="80"
            cy="80"
            r="52"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.12"
            strokeDasharray="2 6"
          />

          {CARDINALS.map((label, index) => {
            const angle = (index * 45 * Math.PI) / 180;
            const isMain = index % 2 === 0;
            const radius = isMain ? 60 : 57;

            return (
              <g key={label}>
                <line
                  x1={80 + Math.sin(angle) * 50}
                  y1={80 - Math.cos(angle) * 50}
                  x2={80 + Math.sin(angle) * 55}
                  y2={80 - Math.cos(angle) * 55}
                  stroke="var(--accent)"
                  strokeOpacity={isMain ? 0.45 : 0.22}
                  strokeWidth={isMain ? 1.4 : 1}
                />
                {isMain ? (
                  <text
                    x={80 + Math.sin(angle) * radius}
                    y={80 - Math.cos(angle) * radius + 3.5}
                    textAnchor="middle"
                    fill="var(--muted)"
                    fontSize="9"
                    fontFamily="var(--font-sans)"
                  >
                    {label}
                  </text>
                ) : null}
              </g>
            );
          })}

          <g transform={`rotate(${rotation} 80 80)`}>
            <path
              d="M80 26 86 56 80 50 74 56Z"
              fill="var(--accent)"
              fillOpacity="0.9"
            />
            <line
              x1="80"
              y1="56"
              x2="80"
              y2="104"
              stroke="var(--accent)"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="80"
              cy="104"
              r="3"
              fill="none"
              stroke="var(--accent)"
              strokeOpacity="0.5"
            />
          </g>

          <circle cx="80" cy="80" r="5" fill="var(--deep)" stroke="var(--accent)" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="1.6" fill="var(--accent)" />
        </svg>

        <div className="min-w-0">
          <p className="tabular font-display text-2xl leading-none text-parchment">
            {formatWind(speed)}
          </p>
          <p className="mt-1 text-xs font-semibold text-gold-soft">
            desde el {direction}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            {Number.isFinite(gust) && gust > 0
              ? `Ráfagas de ${formatWind(gust)}.`
              : "Sin ráfagas registradas."}
          </p>
        </div>
      </div>
    </article>
  );
}
