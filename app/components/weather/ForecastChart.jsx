"use client";

import { useMemo, useState } from "react";
import {
  capitalize,
  formatLocalHour,
  formatTemp,
  getConditionGroup,
} from "@/lib/format";
import ConditionGlyph from "./ConditionGlyph";

const W = 720;
const H = 240;
const PAD = { top: 26, right: 24, bottom: 24, left: 24 };
const TEMP_BAND = 118;
const BAR_MAX = 40;
const BAR_BASE = 204;

/**
 * Gráfica interactiva de las próximas 36 horas: temperatura y probabilidad
 * de lluvia. Se puede explorar con puntero, foco y teclado.
 */
export default function ForecastChart({ list = [], timezone = 0, unit = "C" }) {
  const items = useMemo(() => list.slice(0, 12), [list]);
  const [selected, setSelected] = useState(0);

  const geometry = useMemo(() => {
    if (items.length < 2) return null;

    const temps = items.map((item) => item.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const span = Math.max(max - min, 1);
    const plotWidth = W - PAD.left - PAD.right;

    const points = items.map((item, index) => {
      const ratio = (item.temp - min) / span;
      const x = PAD.left + (index * plotWidth) / (items.length - 1);
      const y = PAD.top + (1 - ratio) * TEMP_BAND;
      return { x, y, item };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(" ");

    const first = points[0];
    const last = points[points.length - 1];
    const areaPath = `${linePath} L${last.x.toFixed(1)} ${BAR_BASE} L${first.x.toFixed(1)} ${BAR_BASE} Z`;
    const columnWidth = ((plotWidth / (items.length - 1)) / W) * 100;

    return { points, linePath, areaPath, tempMin: min, tempMax: max, columnWidth };
  }, [items]);

  if (items.length < 2) {
    return (
      <section className="panel instrument p-5">
        <p className="label">Pronóstico</p>
        <p className="mt-2 text-sm text-muted">
          El pronóstico no está disponible en este momento. El reporte actual
          sigue siendo válido.
        </p>
      </section>
    );
  }

  const activeIndex = Math.min(selected, items.length - 1);
  const active = items[activeIndex];
  const condition = getConditionGroup(active.main);

  return (
    <section className="panel instrument reveal reveal-delay-1 p-4 sm:p-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label">Trayectoria de 36 horas</p>
          <h2 className="mt-1 font-display text-xl text-parchment">
            El pulso del cielo
          </h2>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gold/20 bg-ink/40 px-3 py-2">
          <ConditionGlyph
            condition={condition}
            daypart={active.icon?.endsWith("n") ? "night" : "day"}
            className="h-6 w-6 text-gold"
          />
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-parchment">
              {formatLocalHour(active.dt, timezone)} · {formatTemp(active.temp, unit)}
            </p>
            <p className="text-[11px] text-muted">
              {capitalize(active.description) || "Pronóstico"} ·{" "}
              {Math.round((active.pop || 0) * 100)}% lluvia
            </p>
          </div>
        </div>
      </header>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Gráfica de temperatura y lluvia para las próximas ${items.length * 3} horas. Usa las flechas para recorrer cada hora.`}
          className="block h-auto w-full"
        >
          <defs>
            <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chart-rain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--rain)" stopOpacity="0.85" />
              <stop offset="1" stopColor="var(--rain)" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = PAD.top + ratio * TEMP_BAND;
            return (
              <line
                key={ratio}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--accent)"
                strokeOpacity="0.1"
                strokeDasharray="3 6"
              />
            );
          })}

          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={BAR_BASE}
            y2={BAR_BASE}
            stroke="var(--accent)"
            strokeOpacity="0.25"
          />

          {items.map((item, index) => {
            const progress = Math.max(0, Math.min(1, item.pop || 0));
            const height = progress * BAR_MAX;
            const x = PAD.left + (index * (W - PAD.left - PAD.right)) / (items.length - 1);

            return (
              <rect
                key={`bar-${item.dt}`}
                x={x - 5}
                y={BAR_BASE - height}
                width="10"
                height={height}
                rx="3"
                fill="url(#chart-rain)"
                opacity={index === activeIndex ? 1 : 0.55}
              />
            );
          })}

          <path d={geometry.areaPath} fill="url(#chart-area)" />
          <path
            d={geometry.linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {geometry.points.map((point, index) => (
            <g key={`point-${point.item.dt}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={index === activeIndex ? 6 : 3.5}
                fill={index === activeIndex ? "var(--accent)" : "var(--deep)"}
                stroke="var(--accent)"
                strokeWidth={index === activeIndex ? 2 : 1.4}
              />
              <text
                x={point.x}
                y={H - 6}
                textAnchor="middle"
                fill={index === activeIndex ? "var(--parchment)" : "var(--muted)"}
                fontSize="9.5"
                fontFamily="var(--font-sans)"
              >
                {formatLocalHour(point.item.dt, timezone)}
              </text>
            </g>
          ))}

          <line
            x1={geometry.points[activeIndex].x}
            x2={geometry.points[activeIndex].x}
            y1={geometry.points[activeIndex].y + 8}
            y2={BAR_BASE}
            stroke="var(--accent)"
            strokeOpacity="0.3"
            strokeDasharray="3 5"
          />

          <text
            x={geometry.points[activeIndex].x}
            y={Math.max(14, geometry.points[activeIndex].y - 14)}
            textAnchor="middle"
            fill="var(--parchment)"
            fontSize="13"
            fontWeight="600"
            fontFamily="var(--font-sans)"
          >
            {formatTemp(active.temp, unit)}
          </text>
        </svg>

        <div
          className="absolute inset-0 flex"
          role="group"
          aria-label="Seleccionar hora del pronóstico"
        >
          {items.map((item, index) => (
            <button
              key={`key-${item.dt}`}
              type="button"
              aria-pressed={index === activeIndex}
              aria-label={`${formatLocalHour(item.dt, timezone)}: ${formatTemp(item.temp, unit)}, ${item.description || "sin descripción"}, ${Math.round((item.pop || 0) * 100)}% de lluvia`}
              onPointerEnter={() => setSelected(index)}
              onFocus={() => setSelected(index)}
              onClick={() => setSelected(index)}
              className="h-full flex-1 cursor-crosshair rounded-sm outline-none transition focus-visible:bg-gold/10"
            />
          ))}
        </div>
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-gold" aria-hidden />
          Temperatura
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-sm bg-rain" aria-hidden />
          Probabilidad de lluvia
        </span>
        <span className="tabular">
          Mín {formatTemp(geometry.tempMin, unit)} · Máx{" "}
          {formatTemp(geometry.tempMax, unit)}
        </span>
      </p>
    </section>
  );
}
