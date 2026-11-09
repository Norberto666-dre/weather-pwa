import { formatClock, getSolarProgress } from "@/lib/format";
import { MoonIcon, SunIcon } from "./icons";

/**
 * Arco solar del lugar: posición del sol entre el amanecer y el atardecer.
 */
export default function SunArc({ weather, className = "" }) {
  const solar = getSolarProgress(weather);
  const sunrise = formatClock(weather?.sys?.sunrise, weather?.timezone);
  const sunset = formatClock(weather?.sys?.sunset, weather?.timezone);
  const progress = solar?.progress ?? 0;

  // Bézier cuadrática: (20,96) → control (120,4) → (220,96).
  const t = progress;
  const x = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 120 + t * t * 220;
  const y = (1 - t) * (1 - t) * 96 + 2 * (1 - t) * t * 4 + t * t * 96;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <p className="label">Arco solar</p>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
          {solar?.isDaylight ? (
            <>
              <SunIcon className="h-3.5 w-3.5 text-gold" />
              Luz diurna
            </>
          ) : (
            <>
              <MoonIcon className="h-3.5 w-3.5 text-gold-soft" />
              Noche
            </>
          )}
        </span>
      </div>

      <svg
        viewBox="0 0 240 112"
        role="img"
        aria-label={
          solar
            ? `Arco solar: ${Math.round(progress * 100)} % del día transcurrido, amanecer ${sunrise}, atardecer ${sunset}.`
            : "Arco solar no disponible."
        }
        className="mt-1 w-full"
      >
        <line
          x1="10"
          y1="96"
          x2="230"
          y2="96"
          stroke="var(--accent)"
          strokeOpacity="0.22"
          strokeDasharray="2 5"
        />
        <path
          d="M20 96 Q120 4 220 96"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.18"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M20 96 Q120 4 220 96"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${Math.max(progress * 100, 0.5)} 100`}
        />

        {solar ? (
          solar.isDaylight ? (
            <g>
              <circle cx={x} cy={y} r="10" fill="var(--accent)" fillOpacity="0.18" />
              <circle cx={x} cy={y} r="4.5" fill="var(--accent)" />
            </g>
          ) : (
            <g>
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="var(--deep)"
                stroke="var(--accent)"
                strokeOpacity="0.6"
              />
              <circle cx={x - 2.4} cy={y - 1.6} r="4.8" fill="var(--accent)" fillOpacity="0.35" />
            </g>
          )
        ) : null}

        <text
          x="20"
          y="110"
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="9"
          fontFamily="var(--font-sans)"
        >
          {sunrise}
        </text>
        <text
          x="220"
          y="110"
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="9"
          fontFamily="var(--font-sans)"
        >
          {sunset}
        </text>
      </svg>
    </div>
  );
}
