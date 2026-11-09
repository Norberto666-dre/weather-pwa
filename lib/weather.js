async function requestJson(url, signal) {
  let response;

  try {
    response = await fetch(url, {
      signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error("No hay conexión. Revisa tu internet e intenta de nuevo.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.error || "No se pudo obtener la información del clima."
    );
    error.code = data?.code;
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Clima actual por nombre de ciudad, país o lugar.
 * Acepta formatos como "Oaxaca", "Madrid,ES" o "Buenos Aires,AR".
 */
export function getWeatherByCity(city, signal) {
  return requestJson(
    `/api/weather?city=${encodeURIComponent(city.trim())}`,
    signal
  );
}

/**
 * Clima actual por coordenadas (geolocalización o sugerencia elegida).
 */
export function getWeatherByCoords(lat, lon, signal) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });

  return requestJson(`/api/weather?${params.toString()}`, signal);
}

/**
 * Pronóstico de 5 días / 3 horas por nombre de lugar.
 */
export function getForecastByCity(city, signal) {
  return requestJson(
    `/api/forecast?city=${encodeURIComponent(city.trim())}`,
    signal
  );
}

/**
 * Pronóstico de 5 días / 3 horas por coordenadas.
 */
export function getForecastByCoords(lat, lon, signal) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });

  return requestJson(`/api/forecast?${params.toString()}`, signal);
}

/**
 * Busca lugares para desambiguar "México", "Oaxaca", etc.
 * Devuelve como máximo 5 coincidencias.
 */
export async function searchPlaces(query, signal) {
  const term = query.trim();

  if (term.length < 2) return [];

  const data = await requestJson(
    `/api/geocode?q=${encodeURIComponent(term)}`,
    signal
  );

  return Array.isArray(data?.places) ? data.places : [];
}
