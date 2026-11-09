import { NextResponse } from "next/server";

const API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";

const NO_STORE = { "Cache-Control": "no-store" };

function fail(message, status, code) {
  return NextResponse.json({ error: message, code }, { status, headers: NO_STORE });
}

function labelFor(place) {
  return [place.name, place.state, place.country].filter(Boolean).join(", ");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({ places: [] }, { headers: NO_STORE });
  }

  if (query.length > 120) {
    return fail("La búsqueda es demasiado larga.", 400, "INVALID_INPUT");
  }

  if (!API_KEY?.trim()) {
    return fail(
      "Falta configurar la API key. Agrega WEATHER_API_KEY en .env.local y reinicia el servidor.",
      500,
      "MISSING_KEY"
    );
  }

  const url = `${GEOCODE_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;

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
    if (response.status === 401) {
      return fail(
        "La API key de OpenWeatherMap no es válida o todavía no está activa.",
        502,
        "INVALID_KEY"
      );
    }

    if (response.status === 429) {
      return fail(
        "Se alcanzó el límite de solicitudes de OpenWeatherMap. Espera unos minutos.",
        429,
        "RATE_LIMITED"
      );
    }

    return fail(
      data?.message || "No se pudieron buscar coincidencias.",
      502,
      "UPSTREAM_ERROR"
    );
  }

  const places = Array.isArray(data)
    ? data.map((place) => ({
        name: place.name,
        state: place.state || "",
        country: place.country || "",
        lat: place.lat,
        lon: place.lon,
        label: labelFor(place),
      }))
    : [];

  return NextResponse.json({ places }, { headers: NO_STORE });
}
