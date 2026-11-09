import { NextResponse } from "next/server";

const API_KEY = process.env.WEATHER_API_KEY;
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const NO_STORE = { "Cache-Control": "no-store" };

function fail(message, status, code) {
  return NextResponse.json({ error: message, code }, { status, headers: NO_STORE });
}

function mapItem(item) {
  const weather = Array.isArray(item.weather) ? item.weather[0] : null;

  return {
    dt: item.dt,
    temp: item.main?.temp,
    feelsLike: item.main?.feels_like,
    tempMin: item.main?.temp_min,
    tempMax: item.main?.temp_max,
    humidity: item.main?.humidity,
    pressure: item.main?.pressure,
    wind: item.wind?.speed,
    gust: item.wind?.gust,
    deg: item.wind?.deg,
    pop: Number.isFinite(item.pop) ? item.pop : 0,
    rain: item.rain?.["3h"] ?? 0,
    snow: item.snow?.["3h"] ?? 0,
    clouds: item.clouds?.all ?? 0,
    main: weather?.main || "",
    description: weather?.description || "",
    icon: weather?.icon || "",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() || "";
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  if (!API_KEY?.trim()) {
    return fail(
      "Falta configurar la API key. Agrega WEATHER_API_KEY en .env.local y reinicia el servidor.",
      500,
      "MISSING_KEY"
    );
  }

  let query;

  if (city) {
    if (city.length > 120) {
      return fail("El nombre de la ciudad es demasiado largo.", 400, "INVALID_INPUT");
    }
    query = `q=${encodeURIComponent(city)}`;
  } else if (latParam !== null && lonParam !== null) {
    const lat = Number.parseFloat(latParam);
    const lon = Number.parseFloat(lonParam);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return fail("Las coordenadas no son válidas.", 400, "INVALID_INPUT");
    }

    query = `lat=${lat}&lon=${lon}`;
  } else {
    return fail(
      "Indica una ciudad o tu ubicación para consultar el pronóstico.",
      400,
      "INVALID_INPUT"
    );
  }

  const url = `${FORECAST_URL}?${query}&units=metric&lang=es&appid=${API_KEY}`;

  let response;
  let data = null;

  try {
    response = await fetch(url, { cache: "no-store" });
    data = await response.json().catch(() => null);
  } catch {
    return fail(
      "No se pudo conectar con OpenWeatherMap. Revisa tu conexión e intenta de nuevo.",
      503,
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    switch (response.status) {
      case 401:
        return fail(
          "La API key de OpenWeatherMap no es válida o todavía no está activa. Verifica WEATHER_API_KEY.",
          502,
          "INVALID_KEY"
        );
      case 404:
        return fail(
          city
            ? `No se encontró el pronóstico para "${city}".`
            : "No se encontró el pronóstico para esa ubicación.",
          404,
          "NOT_FOUND"
        );
      case 429:
        return fail(
          "Se alcanzó el límite de solicitudes de OpenWeatherMap. Espera unos minutos e intenta de nuevo.",
          429,
          "RATE_LIMITED"
        );
      default:
        return fail(
          data?.message || "OpenWeatherMap no pudo responder la consulta.",
          502,
          "UPSTREAM_ERROR"
        );
    }
  }

  const list = Array.isArray(data?.list) ? data.list.map(mapItem) : [];

  return NextResponse.json(
    {
      city: {
        name: data?.city?.name || "",
        country: data?.city?.country || "",
        timezone: data?.city?.timezone ?? 0,
        sunrise: data?.city?.sunrise ?? null,
        sunset: data?.city?.sunset ?? null,
        population: data?.city?.population ?? null,
      },
      list: list.slice(0, 40),
      fetchedAt: Date.now(),
    },
    { headers: NO_STORE }
  );
}
