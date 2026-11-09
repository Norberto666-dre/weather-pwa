import { clamp, formatVisibility } from "@/lib/format";
import { EyeIcon } from "./icons";

function visibilityLabel(meters) {
  if (!Number.isFinite(meters)) return "Sin dato";
  if (meters >= 10_000) return "Horizonte despejado";
  if (meters >= 5_000) return "Bruma ligera";
  if (meters >= 2_000) return "Bruma";
  return "Niebla cerrada";
}

export default function VisibilityBar({ visibility }) {
  const value = Number.isFinite(visibility) ? visibility : 0;
  const filled = clamp(Math.round((value / 10_000) * 10), 0, 10);
  const label = visibilityLabel(value);

  return (
    <article className="panel instrument p-4">
      <header className="flex items-center justify-between gap-2">
        <p className="label">Visibilidad</p>
        <EyeIcon className="h-4 w-4 text-gold" />
      </header>

      <p className="tabular mt-3 font-display text-2xl leading-none text-parchment">
        {formatVisibility(value)}
      </p>
      <p className="mt-1 text-xs font-semibold text-gold-soft">{label}</p>

      <div
        className="mt-4 flex gap-1"
        role="img"
        aria-label={`Visibilidad de ${formatVisibility(value)}: ${label}.`}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={[
              "h-4 flex-1 rounded-sm transition-colors",
              index < filled
                ? "bg-gold/80"
                : "bg-white/[0.07] ring-1 ring-inset ring-white/10",
            ].join(" ")}
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-muted">
        <span>0 km</span>
        <span>10 km+</span>
      </div>
    </article>
  );
}
