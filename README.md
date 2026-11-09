# WeatherPWA — Almanaque del clima

Aplicación del clima instalable, hecha con **Next.js 16**, **React 19** y
**Tailwind CSS 4**. Busca el clima actual de cualquier ciudad, país o lugar,
muestra un pronóstico de cinco días y guarda el último reporte para consultarlo
sin conexión.

La interfaz sigue una dirección visual editorial llamada **Almanaque del
Emblema**: azul tinta, oro y brasa, tipografía serif para los titulares e
instrumentos dibujados en SVG (brújula de viento, arco solar, humedad, presión y
visibilidad) que cambian de ambiente según la hora y la condición del cielo.

## Características

- Búsqueda por ciudad, país o lugar con sugerencias para desambiguar.
- Clima actual con sensación térmica, humedad, viento, presión, nubosidad y
  visibilidad.
- Pronóstico de 5 días / 3 horas con gráfica interactiva de temperatura y
  probabilidad de lluvia.
- Geolocalización del dispositivo.
- Unidades **°C / °F** persistidas en el navegador.
- Búsquedas recientes y último reporte guardados en `localStorage`.
- PWA instalable con manifest, iconos desde el emblema, botón de instalación,
  hoja de instrucciones para iOS y banner de invitación.
- Service worker con precache del shell, página offline, estrategia
  network-first para navegación y cache-first para estáticos.
- Aviso de nueva versión del service worker y modo sin conexión.
- Accesibilidad: navegación por teclado, foco visible, etiquetas ARIA, contraste
  y respeto a `prefers-reduced-motion`.

## Requisitos

- Node.js 20 o superior.
- Una API key gratuita de [OpenWeatherMap](https://home.openweathermap.org/api_keys).

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de ejemplo y coloca tu clave:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   WEATHER_API_KEY=tu_api_key_aqui
   ```

   La clave se usa **solo en el servidor**, dentro de los route handlers de
   `app/api/`. Nunca se envía al navegador ni se guarda en el repositorio.

3. Inicia el entorno de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000).

> Cada vez que cambies `.env.local` debes reiniciar el servidor.

## Scripts

```bash
npm run dev      # desarrollo
npm run lint     # ESLint
npm run build    # build de producción
npm start        # servidor de producción
```

Para regenerar los iconos instalables desde el emblema:

```bash
node scripts/generate-icons.mjs
```

El script usa `sharp` para componer el emblema sobre el fondo tinta y genera
`public/assets/icons/`, `public/assets/emblema*.png`, `app/icon.png` y
`app/apple-icon.png`.

## PWA y modo offline

- **Manifest:** `app/manifest.js`, servido en `/manifest.webmanifest`. Incluye
  iconos normales y maskable, atajos de búsqueda y ubicación, y
  `display_override`.
- **Service worker:** `public/sw.js` (`weatherpwa-v3`). Se registra únicamente en
  producción para no interferir con el hot reload.
- **Precache:** shell `/`, `/offline.html`, manifest e iconos principales.
- **Navegación:** red primero con un límite de espera de 4.5 s; si falla, usa el
  shell o la página offline guardada.
- **Estáticos e iconos del clima:** caché primero con refresco en segundo plano.
- **API:** las rutas `/api/` siempre van a la red y nunca se cachean.

### Probar la instalación

```bash
npm run build
npm start
```

Abre `http://localhost:3000` en Chrome o Edge y revisa
**DevTools → Application → Manifest / Service Workers**. El prompt nativo de
instalación requiere `localhost` o HTTPS y no aparece en `next dev`.

En iPhone/iPad, la app muestra las instrucciones para **Compartir → Añadir a
pantalla de inicio**.

### Probar el modo offline

1. Carga la app y consulta un lugar.
2. En DevTools → Application → Service Workers, activa **Offline** o detén el
   servidor y recarga.
3. La app debe mostrar el último reporte guardado. Si no hay datos, aparece la
   página `offline.html`.

## Estructura

```text
app/
  api/weather/route.js       Proxy del clima actual (protege la key)
  api/forecast/route.js      Proxy del pronóstico 5d/3h
  api/geocode/route.js       Sugerencias de lugares
  components/
    InstallBanner.jsx        Invitación flotante a instalar
    InstallButton.jsx        Botón del encabezado
    InstallSheet.jsx         Diálogo nativo con instrucciones
    ServiceWorkerRegister.jsx Registro y aviso de actualización
    ConnectionStatus.jsx     Indicador sin conexión
    weather/                 Instrumentos, gráficas e iconos SVG
  layout.js                  Metadatos, skip link y captura temprana del prompt
  manifest.js                Manifest de la PWA
  page.js                    Orquestación de búsqueda, datos y UI
  globals.css                Tokens, temas y estilos del almanaque
lib/
  weather.js                 Cliente de las rutas /api
  format.js                  Formato de fechas, temperaturas y pronóstico
  pwa.js                     Hooks de instalación y estado de conexión
public/
  sw.js                      Service worker
  offline.html               Fallback sin conexión
  assets/                    Emblema e iconos instalables
scripts/
  generate-icons.mjs         Generador de iconos desde el emblema
```

## Datos

- Clima actual: [OpenWeatherMap Current Weather](https://openweathermap.org/current).
- Pronóstico: [OpenWeatherMap 5 day / 3 hour Forecast](https://openweathermap.org/forecast5).
- Geocodificación: [OpenWeatherMap Geocoding API](https://openweathermap.org/api/geocoding-api).

El pronóstico y el clima actual usan la misma API key gratuita. La app no
incluye calidad del aire ni datos históricos.

## Notas de desarrollo

- No se agregaron dependencias de gráficas: todos los instrumentos son SVG
  propios.
- Los assets originales de `app/assets/` se conservan sin modificaciones.
- `.env.local` está ignorado por git; `.env.example` solo contiene un
  placeholder.
- El diseño y sus tokens están documentados en [`design.md`](./design.md).
