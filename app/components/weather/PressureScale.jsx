import { clamp, pressureLabel } from "@/lib/format";
import { GaugeIcon } from "./icons";

export default function PressureScale({ pressure }) {
  const value = Number.isFinite(pressure) ? pressure : 1013;
  const percent = clamp(((value - 950) / 100) * 100, 0, 100);
  const label = pressureLabel(value);

  return (
    <article className="panel instrument p-4">
      <header className="flex items-center justify-between gap-2">
        <p className="label">Presión</p>
        <GaugeIcon className="h-4 w-4 text-gold" />
      </header>

      <p className="tabular mt-3 font-display text-2xl leading-none text-parchment">
        {Math.round(value)}{" "}
        <span className="text-sm font-normal text-muted">hPa</span>
      </p>
      <p className="mt-1 text-xs font-semibold text-gold-soft">
        Presión {label}
      </p>

      <div
        className="relative mt-4 h-2 rounded-full bg-linear-to-r from-rain via-success to-ember"
        role="img"
        aria-label={`Presión de ${Math.round(value)} hectopascales, considerada ${label}.`}
      >
        <span
          className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-parchment shadow-[0_0_0_3px_rgba(7,19,28,0.65)]"
          style={{ left: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-muted">
        <span>Baja</span>
        <span>Normal</span>
        <span>Alta</span>
      </div>
    </article>
  );
}
