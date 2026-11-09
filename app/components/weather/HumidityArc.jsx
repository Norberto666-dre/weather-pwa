import { formatTemp } from "@/lib/format";
import { DropletIcon } from "./icons";

export default function HumidityArc({ humidity, temp, unit = "C" }) {
  const value = Number.isFinite(humidity) ? Math.max(0, Math.min(100, humidity)) : 0;
  const dewPoint =
    Number.isFinite(humidity) && Number.isFinite(temp)
      ? temp - (100 - humidity) / 5
      : null;

  return (
    <article className="panel instrument p-4">
      <header className="flex items-center justify-between gap-2">
        <p className="label">Humedad</p>
        <DropletIcon className="h-4 w-4 text-rain" />
      </header>

      <svg
        viewBox="0 0 184 108"
        role="img"
        aria-label={`Humedad relativa del ${Math.round(value)} %.${
          dewPoint !== null
            ? ` Punto de rocío aproximado ${formatTemp(dewPoint, unit)}.`
            : ""
        }`}
        className="mt-2 w-full"
      >
        <defs>
          <linearGradient id="humidity-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--sea)" />
            <stop offset="1" stopColor="var(--rain)" />
          </linearGradient>
        </defs>

        <path
          d="M24 96 A68 68 0 0 1 160 96"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M24 96 A68 68 0 0 1 160 96"
          fill="none"
          stroke="url(#humidity-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${Math.max(value, 1)} 100`}
          opacity="0.9"
        />

        <line x1="92" y1="20" x2="92" y2="32" stroke="var(--accent)" strokeOpacity="0.35" />
        <line x1="24" y1="96" x2="30" y2="96" stroke="var(--muted)" strokeOpacity="0.6" />
        <line x1="154" y1="96" x2="160" y2="96" stroke="var(--muted)" strokeOpacity="0.6" />

        <text
          x="92"
          y="82"
          textAnchor="middle"
          fill="var(--parchment)"
          fontSize="26"
          fontFamily="var(--font-sans)"
          fontWeight="600"
        >
          {Math.round(value)}%
        </text>
      </svg>

      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        {dewPoint !== null
          ? `Punto de rocío aprox. ${formatTemp(dewPoint, unit)}.`
          : "Dato no disponible."}
      </p>
    </article>
  );
}
