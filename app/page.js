"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getForecastByCity,
  getForecastByCoords,
  getWeatherByCity,
  getWeatherByCoords,
  searchPlaces,
} from "@/lib/weather";
import {
  getConditionGroup,
  getDaypart,
  getDaypartLabel,
  groupForecastByDay,
  isValidForecast,
  isValidWeather,
} from "@/lib/format";
import { usePwaInstall } from "@/lib/pwa";
import ConnectionStatus from "./components/ConnectionStatus";
import InstallBanner from "./components/InstallBanner";
import InstallButton from "./components/InstallButton";
import InstallSheet from "./components/InstallSheet";
import DailyStrip from "./components/weather/DailyStrip";
import ForecastChart from "./components/weather/ForecastChart";
import HumidityArc from "./components/weather/HumidityArc";
import PressureScale from "./components/weather/PressureScale";
import VisibilityBar from "./components/weather/VisibilityBar";
import WeatherHero from "./components/weather/WeatherHero";
import WindCompass from "./components/weather/WindCompass";
import {
  AlertIcon,
  CloseIcon,
  LocationIcon,
  RefreshIcon,
  SearchIcon,
} from "./components/weather/icons";

const REPORT_KEY = "weatherpwa:last-report";
const LEGACY_WEATHER_KEY = "weatherpwa:last-weather";
const RECENT_KEY = "weatherpwa:recent";
const UNIT_KEY = "weatherpwa:unit";

function readStoredJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatPlaceLabel(place) {
  return [place.name, place.state, place.country].filter(Boolean).join(", ");
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);

  const [unit, setUnit] = useState("C");
  const [recent, setRecent] = useState([]);
  const [installOpen, setInstallOpen] = useState(false);

  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const suppressSuggestRef = useRef(false);
  const deepLinkRef = useRef(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const {
    canInstall,
    isInstalled,
    isIos,
    isDismissed,
    install,
    dismiss,
  } = usePwaInstall();

  // Carga la última consulta y las preferencias guardadas.
  /* eslint-disable react-hooks/set-state-in-effect -- la hidratación desde localStorage debe ocurrir después del montaje para no romper la hidratación SSR */
  useEffect(() => {
    try {
      const savedUnit = window.localStorage.getItem(UNIT_KEY);
      if (savedUnit === "C" || savedUnit === "F") setUnit(savedUnit);
    } catch {
      // localStorage puede estar bloqueado; se usa el valor por defecto.
    }

    const cached = readStoredJson(REPORT_KEY);

    if (cached && isValidWeather(cached.weather)) {
      setWeather(cached.weather);
      setForecast(isValidForecast(cached.forecast) ? cached.forecast : null);
      setFetchedAt(
        typeof cached.savedAt === "number"
          ? cached.savedAt
          : cached.weather.fetchedAt ?? null
      );
      setFromCache(true);
    } else {
      const legacy = readStoredJson(LEGACY_WEATHER_KEY);

      if (legacy && isValidWeather(legacy.data)) {
        setWeather(legacy.data);
        setFetchedAt(
          typeof legacy.savedAt === "number"
            ? legacy.savedAt
            : legacy.data.fetchedAt ?? null
        );
        setFromCache(true);
      } else if (isValidWeather(legacy)) {
        setWeather(legacy);
        setFetchedAt(
          typeof legacy.fetchedAt === "number" ? legacy.fetchedAt : null
        );
        setFromCache(true);
      }
    }

    const savedRecent = readStoredJson(RECENT_KEY);

    if (Array.isArray(savedRecent)) {
      setRecent(
        savedRecent
          .filter(
            (item) =>
              item &&
              typeof item.label === "string" &&
              (typeof item.city === "string" ||
                (Number.isFinite(item.lat) && Number.isFinite(item.lon)))
          )
          .slice(0, 5)
      );
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sugerencias de lugares con debounce.
  useEffect(() => {
    const term = query.trim();

    if (suppressSuggestRef.current) {
      suppressSuggestRef.current = false;
      return undefined;
    }

    if (term.length < 2) {
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(term, controller.signal);
        if (controller.signal.aborted) return;
        setSuggestions(places);
        setSuggestionsOpen(places.length > 0);
        setActiveSuggestion(-1);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Cierra las sugerencias al tocar fuera del buscador.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const persistRecent = useCallback((updater) => {
    setRecent((previous) => {
      const next = updater(previous).slice(0, 5);

      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Sin persistencia disponible.
      }

      return next;
    });
  }, []);

  const runFetch = useCallback(
    async ({ weatherCall, forecastCall }) => {
      const requestId = ++requestIdRef.current;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setGeoBusy(false);
      setError("");
      setErrorCode("");

      try {
        const [weatherResult, forecastResult] = await Promise.allSettled([
          weatherCall(controller.signal),
          forecastCall(controller.signal),
        ]);

        if (requestId !== requestIdRef.current) return;

        if (weatherResult.status === "rejected") {
          throw weatherResult.reason;
        }

        const data = weatherResult.value;

        if (!isValidWeather(data)) {
          throw new Error(
            "La respuesta del clima no es válida. Intenta de nuevo."
          );
        }

        const nextForecast =
          forecastResult.status === "fulfilled" &&
          isValidForecast(forecastResult.value)
            ? forecastResult.value
            : null;
        const savedAt = Date.now();

        setWeather(data);
        setForecast(nextForecast);
        setFetchedAt(savedAt);
        setFromCache(false);
        setSuggestionsOpen(false);
        setActiveSuggestion(-1);

        try {
          window.localStorage.setItem(
            REPORT_KEY,
            JSON.stringify({ weather: data, forecast: nextForecast, savedAt })
          );
          window.localStorage.removeItem(LEGACY_WEATHER_KEY);
        } catch {
          // La app sigue funcionando sin caché local.
        }

        const label = [data.name, data.sys?.country]
          .filter(Boolean)
          .join(", ");

        persistRecent((previous) => [
          {
            label,
            city: null,
            lat: Number.isFinite(data.coord?.lat) ? data.coord.lat : null,
            lon: Number.isFinite(data.coord?.lon) ? data.coord.lon : null,
          },
          ...previous.filter((item) => item.label !== label),
        ]);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        if (err?.name === "AbortError") return;

        setError(
          err?.message || "No se pudo obtener el clima. Intenta de nuevo."
        );
        setErrorCode(err?.code || "");
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [persistRecent]
  );

  const fetchByCity = useCallback(
    (city) => {
      const term = city.trim();

      if (!term) {
        setError("Escribe una ciudad, país o lugar.");
        setErrorCode("EMPTY");
        return;
      }

      setLastRequest({ city: term });
      runFetch({
        weatherCall: (signal) => getWeatherByCity(term, signal),
        forecastCall: (signal) => getForecastByCity(term, signal),
      });
    },
    [runFetch]
  );

  const fetchByCoords = useCallback(
    (lat, lon) => {
      setLastRequest({ lat, lon });
      runFetch({
        weatherCall: (signal) => getWeatherByCoords(lat, lon, signal),
        forecastCall: (signal) => getForecastByCoords(lat, lon, signal),
      });
    },
    [runFetch]
  );

  const selectPlace = useCallback(
    (place) => {
      suppressSuggestRef.current = true;
      setQuery(place.label || formatPlaceLabel(place));
      setSuggestions([]);
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
      fetchByCoords(place.lat, place.lon);
    },
    [fetchByCoords]
  );

  const handleGeoLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta geolocalización.");
      setErrorCode("GEO_UNSUPPORTED");
      return;
    }

    setGeoBusy(true);
    setError("");
    setErrorCode("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchByCoords(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        setGeoBusy(false);

        const messages = {
          1: "Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.",
          2: "No se pudo determinar tu ubicación. Intenta de nuevo o busca tu ciudad.",
          3: "La ubicación tardó demasiado. Intenta de nuevo.",
        };

        setError(
          messages[geoError.code] || "No se pudo obtener tu ubicación."
        );
        setErrorCode("GEO_ERROR");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [fetchByCoords]);

  // Atajos del manifest: /?focus=search y /?locate=1.
  useEffect(() => {
    if (deepLinkRef.current) return;
    deepLinkRef.current = true;

    const params = new URLSearchParams(window.location.search);

    if (params.get("focus") === "search") {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(timer);
    }

    if (params.get("locate") === "1") {
      const timer = window.setTimeout(() => handleGeoLocation(), 300);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [handleGeoLocation]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      suggestionsOpen &&
      activeSuggestion >= 0 &&
      suggestions[activeSuggestion]
    ) {
      selectPlace(suggestions[activeSuggestion]);
      return;
    }

    fetchByCity(query);
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setActiveSuggestion(-1);

    if (event.target.value.trim().length < 2) {
      setSuggestionsOpen(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
      return;
    }

    if (!suggestionsOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion(
        (index) => (index - 1 + suggestions.length) % suggestions.length
      );
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      selectPlace(suggestions[activeSuggestion]);
    }
  };

  const changeUnit = (nextUnit) => {
    setUnit(nextUnit);

    try {
      window.localStorage.setItem(UNIT_KEY, nextUnit);
    } catch {
      // Preferencia solo en memoria.
    }
  };

  const handleRecent = (entry) => {
    suppressSuggestRef.current = true;
    setQuery(entry.label);
    setSuggestionsOpen(false);

    if (Number.isFinite(entry.lat) && Number.isFinite(entry.lon)) {
      fetchByCoords(entry.lat, entry.lon);
    } else if (entry.city) {
      fetchByCity(entry.city);
    } else {
      fetchByCity(entry.label);
    }
  };

  const clearRecent = () => {
    setRecent([]);

    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      // Sin persistencia disponible.
    }
  };

  const retry = () => {
    if (!lastRequest) return;

    if (
      Number.isFinite(lastRequest.lat) &&
      Number.isFinite(lastRequest.lon)
    ) {
      fetchByCoords(lastRequest.lat, lastRequest.lon);
    } else if (lastRequest.city) {
      fetchByCity(lastRequest.city);
    }
  };

  const refresh = () => {
    if (lastRequest) {
      retry();
      return;
    }

    if (
      Number.isFinite(weather?.coord?.lat) &&
      Number.isFinite(weather?.coord?.lon)
    ) {
      fetchByCoords(weather.coord.lat, weather.coord.lon);
    }
  };

  const canRetry = Boolean(
    lastRequest ||
      (Number.isFinite(weather?.coord?.lat) &&
        Number.isFinite(weather?.coord?.lon))
  );

  const activeOptionId =
    suggestionsOpen && activeSuggestion >= 0
      ? `place-option-${activeSuggestion}`
      : undefined;

  const condition = weather
    ? getConditionGroup(weather.weather?.[0]?.main)
    : "clouds";
  const daypart = weather ? getDaypart(weather) : "day";
  const days = forecast
    ? groupForecastByDay(
        forecast.list,
        forecast.city?.timezone ?? weather?.timezone ?? 0
      )
    : [];
  const timezone = weather?.timezone ?? forecast?.city?.timezone ?? 0;

  const showInstallBanner =
    (canInstall || isIos) &&
    !isDismissed &&
    !isInstalled &&
    Boolean(weather) &&
    !installOpen;

  return (
    <div
      data-daypart={weather ? daypart : undefined}
      data-condition={weather ? condition : undefined}
      className="relative min-h-dvh"
    >
      <div aria-hidden="true" className="sky" />

      <main
        id="contenido"
        className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-28 pt-6 sm:px-6 sm:pt-8"
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/assets/emblema-128.png"
              alt="Emblema de WeatherPWA"
              width={48}
              height={48}
              priority
              className="h-11 w-11 rounded-full ring-1 ring-gold/30 sm:h-12 sm:w-12"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                Almanaque del clima
              </p>
              <h1 className="truncate font-display text-xl leading-tight text-parchment sm:text-2xl">
                WeatherPWA
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ConnectionStatus />

            <div
              className="flex items-center rounded-full border border-white/10 bg-ink/40 p-0.5"
              role="group"
              aria-label="Unidad de temperatura"
            >
              {["C", "F"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeUnit(option)}
                  aria-pressed={unit === option}
                  className={[
                    "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                    unit === option
                      ? "bg-gold text-ink"
                      : "text-muted hover:text-parchment",
                  ].join(" ")}
                >
                  °{option}
                </button>
              ))}
            </div>

            <InstallButton
              canInstall={canInstall}
              isInstalled={isInstalled}
              isIos={isIos}
              onClick={() => setInstallOpen(true)}
            />
          </div>
        </header>

        <section
          aria-labelledby="search-title"
          className="panel instrument reveal reveal-delay-1 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="label">Buscador</p>
              <h2
                id="search-title"
                className="mt-1 font-display text-lg text-parchment"
              >
                ¿Dónde miras el cielo?
              </h2>
            </div>
            <p className="hidden text-[11px] text-muted sm:block">
              Ciudad, país o lugar
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative mt-3"
            role="search"
            ref={searchRef}
          >
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <label htmlFor="place-search" className="sr-only">
                  Ciudad, país o lugar
                </label>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  ref={inputRef}
                  id="place-search"
                  type="text"
                  inputMode="search"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) setSuggestionsOpen(true);
                  }}
                  placeholder="Oaxaca, Madrid, Buenos Aires…"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={suggestionsOpen}
                  aria-controls={suggestionsOpen ? "place-listbox" : undefined}
                  aria-activedescendant={activeOptionId}
                  aria-autocomplete="list"
                  className="w-full rounded-xl border border-white/10 bg-ink/55 py-2.5 pl-9 pr-9 text-sm text-parchment placeholder:text-muted/70 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/25"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                      setSuggestionsOpen(false);
                      inputRef.current?.focus();
                    }}
                    aria-label="Borrar búsqueda"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:text-parchment"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-gold-soft disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? "Buscando…" : "Buscar"}
              </button>

              <button
                type="button"
                onClick={handleGeoLocation}
                disabled={geoBusy}
                aria-label="Usar mi ubicación actual"
                title="Usar mi ubicación"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-ink/55 px-3 text-muted transition hover:border-gold/40 hover:text-parchment disabled:cursor-wait disabled:text-gold"
              >
                <LocationIcon className={`h-4 w-4 ${geoBusy ? "animate-pulse" : ""}`} />
              </button>
            </div>

            {suggestionsOpen && suggestions.length > 0 ? (
              <ul
                id="place-listbox"
                role="listbox"
                aria-label="Lugares encontrados"
                className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-gold/25 bg-deep/98 shadow-2xl shadow-black/60 backdrop-blur"
              >
                {suggestions.map((place, index) => (
                  <li
                    key={`${place.lat}-${place.lon}`}
                    role="option"
                    id={`place-option-${index}`}
                    aria-selected={index === activeSuggestion}
                  >
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectPlace(place)}
                      onPointerEnter={() => setActiveSuggestion(index)}
                      className={[
                        "flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left text-sm transition",
                        index === activeSuggestion
                          ? "bg-gold/10 text-parchment"
                          : "text-muted hover:bg-white/5 hover:text-parchment",
                      ].join(" ")}
                    >
                      <span className="truncate font-medium">{place.name}</span>
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-muted">
                        {[place.state, place.country].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>

          {recent.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="label">Recientes</span>
              {recent.map((entry) => (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => handleRecent(entry)}
                  className="rounded-full border border-white/10 bg-ink/40 px-2.5 py-1 text-[11px] text-muted transition hover:border-gold/40 hover:text-parchment"
                >
                  {entry.label}
                </button>
              ))}
              <button
                type="button"
                onClick={clearRecent}
                className="rounded-full px-2 py-1 text-[11px] text-muted/80 underline decoration-dotted underline-offset-2 transition hover:text-parchment"
              >
                Limpiar
              </button>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-3 flex flex-wrap items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs leading-relaxed text-danger"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">{error}</span>
              {canRetry ? (
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex items-center gap-1 rounded-md border border-danger/40 px-2 py-1 text-[11px] font-semibold text-danger transition hover:bg-danger/15"
                >
                  <RefreshIcon className="h-3 w-3" />
                  Reintentar
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        {!weather && !loading ? (
          <section className="panel instrument reveal relative overflow-hidden p-6 text-center sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(216,169,74,0.18),transparent_70%)]"
            />
            <Image
              src="/assets/emblema.png"
              alt=""
              width={128}
              height={128}
              className="mx-auto h-24 w-24 opacity-90 sm:h-28 sm:w-28"
            />
            <p className="label mt-4 text-gold">Primera estación</p>
            <h2 className="mx-auto mt-2 max-w-md font-display text-2xl leading-tight text-parchment sm:text-3xl">
              El almanaque espera tu primer lugar
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Busca una ciudad, un país o un lugar con el buscador. También
              puedes usar tu ubicación actual y consultar el cielo de donde
              estás.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-gold-soft"
              >
                <SearchIcon className="h-4 w-4" />
                Buscar un lugar
              </button>
              <button
                type="button"
                onClick={handleGeoLocation}
                disabled={geoBusy}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-ink/40 px-4 py-2.5 text-xs font-semibold text-parchment transition hover:border-gold/40 disabled:cursor-wait disabled:opacity-70"
              >
                <LocationIcon className="h-4 w-4" />
                {geoBusy ? "Ubicando…" : "Mi ubicación"}
              </button>
            </div>
            <p className="mx-auto mt-4 max-w-sm text-[11px] leading-relaxed text-muted/80">
              El almanaque guarda el último reporte en tu dispositivo y lo
              muestra aunque te quedes sin conexión.
            </p>
          </section>
        ) : null}

        {loading && !weather ? (
          <section
            aria-label="Consultando el clima"
            className="panel instrument reveal p-6"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="h-10 w-2/3 rounded-lg bg-white/10" />
              <div className="h-4 w-1/2 rounded-full bg-white/10" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="h-24 rounded-xl bg-white/[0.06]" />
                <div className="h-24 rounded-xl bg-white/[0.06]" />
                <div className="h-24 rounded-xl bg-white/[0.06]" />
              </div>
            </div>
            <span className="sr-only">Cargando el reporte del clima…</span>
          </section>
        ) : null}

        {weather ? (
          <>
            <WeatherHero
              weather={weather}
              days={days}
              unit={unit}
              daypart={daypart}
              condition={condition}
              fetchedAt={fetchedAt}
              fromCache={fromCache}
              loading={loading}
              onRefresh={refresh}
              canRefresh={canRetry}
            />

            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <ForecastChart
                  list={forecast?.list ?? []}
                  timezone={timezone}
                  unit={unit}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:col-span-4 md:grid-cols-1">
                <HumidityArc
                  humidity={weather.main?.humidity}
                  temp={weather.main?.temp}
                  unit={unit}
                />
                <VisibilityBar visibility={weather.visibility} />
              </div>

              <div className="md:col-span-12">
                <DailyStrip days={days} unit={unit} />
              </div>

              <div className="md:col-span-6">
                <WindCompass
                  speed={weather.wind?.speed}
                  gust={weather.wind?.gust}
                  deg={weather.wind?.deg}
                />
              </div>

              <div className="md:col-span-6">
                <PressureScale pressure={weather.main?.pressure} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-ink/30 px-3 py-2.5 text-[11px] text-muted">
              <p>
                {getDaypartLabel(daypart)} en {weather.name} ·{" "}
                {fromCache ? "reporte guardado en este dispositivo" : "reporte recién consultado"}
              </p>
              <button
                type="button"
                onClick={refresh}
                disabled={loading || !canRetry}
                className="inline-flex items-center gap-1.5 font-semibold text-gold-soft transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Consultando…" : "Actualizar reporte"}
              </button>
            </div>
          </>
        ) : null}

        <footer className="mt-2 flex flex-col items-center gap-1 pb-2 text-center text-[11px] leading-relaxed text-muted/80">
          <p>
            Datos del clima por{" "}
            <a
              href="https://openweathermap.org/"
              target="_blank"
              rel="noreferrer"
              className="text-gold-soft underline decoration-dotted underline-offset-2 transition hover:text-gold"
            >
              OpenWeatherMap
            </a>
            . Pronóstico de 5 días cada 3 horas.
          </p>
          <p>WeatherPWA · un almanaque para el cielo de cualquier lugar.</p>
        </footer>
      </main>

      <InstallSheet
        open={installOpen}
        onClose={() => setInstallOpen(false)}
        canInstall={canInstall}
        isInstalled={isInstalled}
        isIos={isIos}
        install={install}
        dismiss={dismiss}
      />

      <InstallBanner
        show={showInstallBanner}
        onInstall={() => setInstallOpen(true)}
        onDismiss={dismiss}
      />
    </div>
  );
}
