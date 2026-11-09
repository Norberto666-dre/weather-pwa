const LOCALE = "es-MX";

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function toDisplayTemp(celsius, unit) {
  if (!Number.isFinite(celsius)) return null;

  return Math.round(unit === "F" ? (celsius * 9) / 5 + 32 : celsius);
}

export function formatTemp(celsius, unit) {
  const value = toDisplayTemp(celsius, unit);
  return value === null ? "—" : `${value}°${unit}`;
}

export function formatWind(speed) {
  if (!Number.isFinite(speed)) return "—";
  return `${(speed * 3.6).toFixed(0)} km/h`;
}

/**
 * Formatea una marca Unix usando el desplazamiento horario del lugar.
 * Se suma el offset y se formatea en UTC para no depender de la zona del equipo.
 */
export function formatLocalDateTime(unixSeconds, offsetSeconds, options = {}) {
  if (!Number.isFinite(unixSeconds)) return "—";

  const date = new Date((unixSeconds + (offsetSeconds || 0)) * 1000);

  return new Intl.DateTimeFormat(LOCALE, {
    ...options,
    timeZone: "UTC",
  }).format(date);
}

export function formatClock(unixSeconds, offsetSeconds) {
  return formatLocalDateTime(unixSeconds, offsetSeconds, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatLocalHour(unixSeconds, offsetSeconds) {
  return `${formatLocalDateTime(unixSeconds, offsetSeconds, {
    hour: "numeric",
    hour12: false,
  })} h`;
}

export function formatDayShort(unixSeconds, offsetSeconds) {
  return formatLocalDateTime(unixSeconds, offsetSeconds, { weekday: "short" });
}

export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getConditionGroup(main) {
  const value = String(main || "").toLowerCase();

  if (value.includes("thunder")) return "storm";
  if (value.includes("drizzle") || value.includes("rain")) return "rain";
  if (value.includes("snow") || value.includes("sleet")) return "snow";
  if (value.includes("clear")) return "clear";
  if (value.includes("cloud")) return "clouds";
  if (
    value.includes("mist") ||
    value.includes("fog") ||
    value.includes("haze") ||
    value.includes("smoke") ||
    value.includes("dust") ||
    value.includes("sand") ||
    value.includes("ash") ||
    value.includes("squall") ||
    value.includes("tornado")
  ) {
    return "mist";
  }

  return "clouds";
}

/**
 * Franja del día en la ubicación consultada, según su hora y sus horas de sol.
 */
export function getDaypart(weather) {
  const offset = weather?.timezone || 0;
  const now = weather?.dt;

  if (!Number.isFinite(now)) {
    return weather?.weather?.[0]?.icon?.endsWith("n") ? "night" : "day";
  }

  const sunrise = weather?.sys?.sunrise;
  const sunset = weather?.sys?.sunset;

  if (Number.isFinite(sunrise) && Number.isFinite(sunset)) {
    const localNow = now + offset;
    const localSunrise = sunrise + offset;
    const localSunset = sunset + offset;

    if (localNow < localSunrise - 900 || localNow > localSunset + 900) {
      return "night";
    }
    if (localNow < localSunrise + 3600) return "dawn";
    if (localNow > localSunset - 3600) return "dusk";
    return "day";
  }

  return weather?.weather?.[0]?.icon?.endsWith("n") ? "night" : "day";
}

export function getDaypartLabel(daypart) {
  const labels = {
    dawn: "Amanecer",
    day: "Día",
    dusk: "Atardecer",
    night: "Noche",
  };

  return labels[daypart] || "Ahora";
}

export function getSolarProgress(weather) {
  const offset = weather?.timezone || 0;
  const sunrise = weather?.sys?.sunrise;
  const sunset = weather?.sys?.sunset;

  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset) || !Number.isFinite(weather?.dt)) {
    return null;
  }

  const localNow = weather.dt + offset;
  const localSunrise = sunrise + offset;
  const localSunset = sunset + offset;
  const total = localSunset - localSunrise;

  if (total <= 0) return null;

  return {
    progress: clamp((localNow - localSunrise) / total, 0, 1),
    isDaylight: localNow >= localSunrise && localNow <= localSunset,
  };
}

export function windDirection(deg) {
  if (!Number.isFinite(deg)) return "—";

  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return directions[Math.round(deg / 45) % 8];
}

export function pressureLabel(pressure) {
  if (!Number.isFinite(pressure)) return "—";
  if (pressure < 1000) return "baja";
  if (pressure > 1020) return "alta";
  return "normal";
}

export function formatVisibility(meters) {
  if (!Number.isFinite(meters)) return "—";
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatUpdatedAt(timestamp) {
  if (!Number.isFinite(timestamp)) return "—";

  return new Date(timestamp).toLocaleString(LOCALE, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isValidWeather(data) {
  return Boolean(
    data &&
      typeof data === "object" &&
      typeof data.name === "string" &&
      data.name &&
      data.main &&
      typeof data.main.temp === "number" &&
      Array.isArray(data.weather) &&
      data.weather[0] &&
      data.sys &&
      data.wind
  );
}

export function isValidForecast(data) {
  return Boolean(
    data &&
      Array.isArray(data.list) &&
      data.list.length > 0 &&
      data.list.every(
        (item) => item && Number.isFinite(item.dt) && Number.isFinite(item.temp)
      )
  );
}

/**
 * Agrupa el pronóstico de 3 h en días locales y calcula mínima, máxima,
 * probabilidad de lluvia e icono representativo (el más cercano al mediodía).
 */
export function groupForecastByDay(list, timezone = 0) {
  if (!Array.isArray(list)) return [];

  const days = new Map();

  for (const item of list) {
    if (!item || !Number.isFinite(item.dt) || !Number.isFinite(item.temp)) {
      continue;
    }

    const localMs = (item.dt + (timezone || 0)) * 1000;
    const date = new Date(localMs);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    const hour = date.getUTCHours();
    const noonDelta = Math.abs(hour - 12);

    const entry = days.get(key) || {
      key,
      dateMs: localMs,
      min: item.temp,
      max: item.temp,
      pop: 0,
      humidityTotal: 0,
      count: 0,
      icon: item.icon,
      description: item.description,
      main: item.main,
      noonDelta: Number.POSITIVE_INFINITY,
    };

    entry.min = Math.min(entry.min, item.temp);
    entry.max = Math.max(entry.max, item.temp);
    entry.pop = Math.max(entry.pop, Number.isFinite(item.pop) ? item.pop : 0);
    entry.humidityTotal += Number.isFinite(item.humidity) ? item.humidity : 0;
    entry.count += 1;

    if (noonDelta < entry.noonDelta) {
      entry.noonDelta = noonDelta;
      entry.icon = item.icon;
      entry.description = item.description;
      entry.main = item.main;
    }

    days.set(key, entry);
  }

  return Array.from(days.values())
    .map((day) => ({
      key: day.key,
      dateMs: day.dateMs,
      min: day.min,
      max: day.max,
      pop: day.pop,
      humidity: day.count ? Math.round(day.humidityTotal / day.count) : null,
      icon: day.icon,
      description: day.description,
      main: day.main,
      label: capitalize(
        new Intl.DateTimeFormat(LOCALE, {
          weekday: "short",
          timeZone: "UTC",
        }).format(new Date(day.dateMs))
      ),
      dateLabel: new Intl.DateTimeFormat(LOCALE, {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(day.dateMs)),
    }))
    .slice(0, 5);
}
