/**
 * Ilustración atmosférica del almanaque. Es decorativa: toda la información
 * vive en el HTML que la acompaña.
 */
export default function ConditionArt({
  condition = "clouds",
  daypart = "day",
  className = "",
}) {
  const isNight = daypart === "night" || daypart === "dawn";
  const showRain = condition === "rain" || condition === "storm";
  const showSnow = condition === "snow";
  const showMist = condition === "mist";
  const showClouds = condition !== "clear" || daypart === "dusk";

  return (
    <svg
      viewBox="0 0 520 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id="almanac-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.42" />
          <stop offset="0.55" stopColor="var(--accent)" stopOpacity="0.12" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="almanac-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--panel-2)" stopOpacity="0.95" />
          <stop offset="1" stopColor="var(--deep)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="almanac-rain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rain)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--rain)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="368" cy="104" r="150" fill="url(#almanac-glow)" />

      {/* Astro: sol del día o luna de la noche. */}
      <g className={isNight ? "" : "drift"}>
        {isNight ? (
          <g>
            <path
              d="M392 62a52 52 0 1 0 58 66 58 58 0 0 1-58-66Z"
              fill="var(--accent)"
              fillOpacity="0.22"
              stroke="var(--accent)"
              strokeOpacity="0.65"
              strokeWidth="2"
            />
            <g fill="var(--parchment)" fillOpacity="0.7">
              <circle cx="300" cy="58" r="1.6" />
              <circle cx="336" cy="36" r="1.2" />
              <circle cx="452" cy="48" r="1.5" />
              <circle cx="476" cy="112" r="1.1" />
              <circle cx="286" cy="118" r="1" />
            </g>
          </g>
        ) : (
          <g stroke="var(--accent)" strokeLinecap="round">
            <circle
              cx="378"
              cy="88"
              r="34"
              fill="var(--accent)"
              fillOpacity="0.16"
              strokeWidth="2"
            />
            <g strokeOpacity="0.5" strokeWidth="1.6">
              <path d="M378 34v-12" />
              <path d="M378 142v12" />
              <path d="M324 88h-12" />
              <path d="M432 88h12" />
              <path d="m340 50-8-8" />
              <path d="m416 126 8 8" />
              <path d="m416 50 8-8" />
              <path d="m340 126-8 8" />
            </g>
          </g>
        )}
      </g>

      {/* Cordillera lejana y horizonte. */}
      <path
        d="M0 226 74 186l52 22 70-44 62 34 70-30 46 22 74-26 72 32v104H0Z"
        fill="var(--deep)"
        fillOpacity="0.55"
      />
      <path
        d="M0 252 90 220l70 18 82-32 78 30 84-24 116 26v62H0Z"
        fill="var(--ink)"
        fillOpacity="0.55"
      />

      {showMist ? (
        <g stroke="var(--accent)" strokeOpacity="0.32" strokeLinecap="round">
          <path d="M42 206h210" strokeWidth="2" />
          <path d="M92 226h256" strokeWidth="2" />
          <path d="M172 246h268" strokeWidth="2" />
          <path d="M24 266h210" strokeWidth="1.5" strokeOpacity="0.2" />
        </g>
      ) : null}

      {showClouds ? (
        <g
          className="drift"
          fill="url(#almanac-cloud)"
          stroke="var(--accent)"
          strokeOpacity="0.22"
          strokeWidth="1.4"
        >
          <path d="M236 188c-17 0-30-13-30-29 0-15 11-27 26-29 4-20 21-35 42-35 20 0 37 12 43 30 18 1 32 15 32 33 0 17-14 30-31 30Z" />
          <path
            d="M92 172c-12 0-22-10-22-22 0-11 8-20 19-22 3-15 16-26 31-26 15 0 27 9 32 22 13 1 23 11 23 24 0 13-11 24-24 24Z"
            fillOpacity="0.7"
          />
        </g>
      ) : null}

      {showRain ? (
        <g stroke="url(#almanac-rain)" strokeWidth="3" strokeLinecap="round">
          {[
            [214, 198, 0],
            [242, 202, 0.35],
            [270, 196, 0.15],
            [298, 204, 0.5],
            [326, 198, 0.25],
            [354, 204, 0.6],
          ].map(([x, y, delay]) => (
            <line
              key={`${x}-${y}`}
              x1={x}
              y1={y}
              x2={x - 4}
              y2={y + 30}
              className="rain-line"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </g>
      ) : null}

      {showSnow ? (
        <g fill="var(--parchment)" fillOpacity="0.7">
          {[
            [220, 208],
            [258, 198],
            [296, 212],
            [334, 200],
            [372, 214],
          ].map(([x, y], index) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={2.2 + (index % 2)}
              className="drift"
              style={{ animationDelay: `${index * 0.4}s` }}
            />
          ))}
        </g>
      ) : null}

      {condition === "storm" ? (
        <path
          d="m300 168-24 42h18l-8 34 36-48h-20l14-28Z"
          fill="var(--accent)"
          fillOpacity="0.85"
        />
      ) : null}
    </svg>
  );
}
