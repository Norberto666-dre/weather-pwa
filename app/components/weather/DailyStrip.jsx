import { formatTemp, getConditionGroup } from "@/lib/format";
import ConditionGlyph from "./ConditionGlyph";
import { DropletIcon, ListIcon } from "./icons";

/**
 * Tira de cinco días con rango térmico y probabilidad de lluvia.
 */
export default function DailyStrip({ days = [], unit = "C" }) {
  if (!days.length) return null;

  const globalMin = Math.min(...days.map((day) => day.min));
  const globalMax = Math.max(...days.map((day) => day.max));
  const span = Math.max(globalMax - globalMin, 1);

  return (
    <section className="panel instrument reveal reveal-delay-2 p-4 sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="label">Calendario</p>
          <h2 className="mt-1 font-display text-xl text-parchment">
            Los próximos días
          </h2>
        </div>
        <ListIcon className="h-4 w-4 text-gold" />
      </header>

      <ul className="scroll-x mt-4 flex snap-x gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const condition = getConditionGroup(day.main);
          const left = ((day.min - globalMin) / span) * 100;
          const width = Math.max(((day.max - day.min) / span) * 100, 8);

          return (
            <li
              key={day.key}
              className="min-w-[8.75rem] flex-1 snap-start rounded-[var(--radius-instrument)] border border-white/10 bg-ink/25 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold capitalize text-parchment">
                    {day.label}
                  </p>
                  <p className="text-[11px] capitalize text-muted">{day.dateLabel}</p>
                </div>
                <ConditionGlyph
                  condition={condition}
                  daypart="day"
                  className="h-5 w-5 text-gold"
                />
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="tabular text-lg font-semibold text-parchment">
                  {formatTemp(day.max, unit)}
                </span>
                <span className="tabular text-xs text-muted">
                  {formatTemp(day.min, unit)}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-sea via-gold to-ember"
                  style={{ marginLeft: `${left}%`, width: `${width}%` }}
                />
              </div>

              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted">
                <DropletIcon className="h-3 w-3 text-rain" />
                {Math.round((day.pop || 0) * 100)}% lluvia
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
