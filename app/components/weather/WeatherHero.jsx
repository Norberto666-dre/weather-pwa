import {
  capitalize,
  formatClock,
  formatLocalDateTime,
  formatTemp,
  formatWind,
  getDaypartLabel,
  toDisplayTemp,
  windDirection,
} from "@/lib/format";
import ConditionArt from "./ConditionArt";
import SunArc from "./SunArc";
import {
  CloudIcon,
  DropletIcon,
  RefreshIcon,
  WindIcon,
} from "./icons";

export default function WeatherHero({
  weather,
  days = [],
  unit = "C",
  daypart = "day",
  condition = "clouds",
  fetchedAt,
  fromCache = false,
  loading = false,
  onRefresh,
  canRefresh = false,
}) {
  const main = weather.main || {};
  const day = weather.weather?.[0] || {};
  const today = days[0];
  const temp = toDisplayTemp(main.temp, unit);
  const feels = formatTemp(main.feels_like, unit);
  const high = formatTemp(today?.max ?? main.temp_max, unit);
  const low = formatTemp(today?.min ?? main.temp_min, unit);
  const localDate = capitalize(
    formatLocalDateTime(weather.dt, weather.timezone, {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
  const localTime = formatClock(weather.dt, weather.timezone);
  const updated =
    Number.isFinite(fetchedAt) && fetchedAt > 1_000_000_000_000
      ? formatClock(fetchedAt / 1000, weather.timezone)
      : formatClock(weather.dt, weather.timezone);

  return (
    <section className="panel instrument reveal relative overflow-hidden">
      <ConditionArt
        condition={condition}
        daypart={daypart}
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[92%] opacity-80 sm:w-[64%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#07131c_10%,rgba(7,19,28,0.92)_44%,rgba(7,19,28,0.35)_78%,rgba(7,19,28,0.1))]"
      />

      <div className="relative p-5 sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label text-gold">Estación actual</p>
            <h1 className="mt-1.5 truncate font-display text-2xl leading-tight text-parchment sm:text-3xl">
              {weather.name}
              {weather.sys?.country ? (
                <span className="ml-2 align-middle text-sm font-normal uppercase tracking-[0.16em] text-muted">
                  {weather.sys.country}
                </span>
              ) : null}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {localDate} · {localTime} h · {getDaypartLabel(daypart)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gold/25 bg-ink/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
              {fromCache ? "Guardado" : "En vivo"}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading || !canRefresh}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/40 px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-gold/40 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Consultando" : "Actualizar"}
            </button>
          </div>
        </header>

        <div className="mt-6 grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,17rem)]">
          <div>
            <div className="flex items-start gap-1">
              <p className="tabular font-display text-[clamp(4.25rem,15vw,7.5rem)] font-semibold leading-[0.82] text-parchment">
                {temp ?? "—"}
              </p>
              <span className="mt-2 font-display text-2xl text-muted">
                °{unit}
              </span>
            </div>

            <p className="mt-3 text-base font-medium text-parchment">
              {capitalize(day.description) || "Condición no disponible"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Sensación {feels} · Máx {high} · Mín {low}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/40 px-2.5 py-1 text-[11px] text-muted">
                <DropletIcon className="h-3.5 w-3.5 text-rain" />
                <span className="tabular text-parchment">{main.humidity ?? "—"}%</span>{" "}
                humedad
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/40 px-2.5 py-1 text-[11px] text-muted">
                <WindIcon className="h-3.5 w-3.5 text-sea" />
                <span className="tabular text-parchment">
                  {formatWind(weather.wind?.speed)}
                </span>{" "}
                {windDirection(weather.wind?.deg)}
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/40 px-2.5 py-1 text-[11px] text-muted">
                <CloudIcon className="h-3.5 w-3.5 text-muted" />
                <span className="tabular text-parchment">
                  {weather.clouds?.all ?? 0}%
                </span>{" "}
                nubes
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-instrument)] border border-white/10 bg-ink/30 p-4 backdrop-blur-sm">
            <SunArc weather={weather} />
            <p className="mt-2 border-t border-white/10 pt-2 text-[10px] uppercase tracking-[0.14em] text-muted">
              Reporte de las {updated} · hora del lugar
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
