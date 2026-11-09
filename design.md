# Almanaque del Emblema

Dirección visual de WeatherPWA. El objetivo es que la app se sienta como un
almanaque editorial y no como un dashboard meteorológico genérico: tinta azul
profunda, oro de sello, brasa de atardecer, serif para los titulares y
instrumentos dibujados a mano en SVG.

## 1. Concepto

Un almanaque de mesa que se adapta al cielo del lugar consultado. El emblema
funciona como sello de identidad y como icono instalable. Cada reporte se lee
como una página: lugar, hora local, condición, arco solar y una serie de
instrumentos analógicos.

Principios:

1. **Editorial, no corporativo.** Titulares serif, reglas finas, etiquetas en
   versalitas y mucho aire.
2. **Instrumentos, no tarjetas.** Cada dato tiene una forma propia: brújula,
   arco, escala o barra.
3. **El cielo cambia.** El fondo, el acento y la ilustración responden a la
   franja del día y a la condición climática.
4. **Legible primero.** El contraste, el tamaño y la jerarquía están por encima
   del efecto visual.
5. **Sin dependencias de gráficas.** Todo se dibuja con SVG y CSS.

## 2. Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `--ink` | `#07131c` | Fondo base, texto sobre oro |
| `--deep` | `#0b2230` | Paneles, profundidad |
| `--panel` | `#0e2734` | Superficie de instrumentos |
| `--panel-2` | `#12303f` | Gradiente de paneles |
| `--parchment` | `#f4ecdd` | Texto principal |
| `--muted` | `#9db0bd` | Texto secundario |
| `--gold` | `#d8a94a` | Acento principal, focos, CTA |
| `--gold-soft` | `#e8c982` | Acento suave, enlaces |
| `--ember` | `#e2683c` | Brasa, atardecer |
| `--sea` | `#47a3a3` | Viento y humedad |
| `--rain` | `#6d9fe0` | Lluvia y precipitación |
| `--danger` | `#e07a6a` | Errores |
| `--success` | `#7fbf8a` | Confirmación de instalación |

Los colores también existen como utilidades de Tailwind 4 mediante `@theme`
(`bg-ink`, `text-gold`, `border-sea`, etc.). Los alias sin prefijo existen para
el CSS propio y las ilustraciones SVG.

## 3. Tipografía

- **Display:** `ui-serif`, Iowan Old Style, Palatino, Georgia, serif. Se usa en
  el wordmark, títulos de sección, temperatura principal y cifras grandes.
- **Sans:** `ui-sans-serif`, system-ui, Segoe UI, Roboto. Se usa en controles,
  párrafos, etiquetas y datos densos.
- **Mono:** solo para números de pasos o detalles técnicos.
- **Etiquetas:** 0.66 rem, mayúsculas, tracking 0.18 em, color muted.
- **Cifras:** `font-variant-numeric: tabular-nums lining-nums` en temperaturas,
  horas y métricas para evitar saltos.

## 4. Temas dinámicos

El contenedor raíz recibe dos atributos:

```html
<div data-daypart="dawn|day|dusk|night" data-condition="clear|clouds|rain|storm|snow|mist">
```

### Franja del día

| Atributo | Cielo | Sensación |
| --- | --- | --- |
| `dawn` | Azul violáceo a terracota | Amanecer |
| `day` | Azul petróleo luminoso | Mediodía |
| `dusk` | Malva a brasa | Atardecer |
| `night` | Azul casi negro | Noche |

Cada franja define `--sky-a`, `--sky-b` y `--sky-c`, usados por el fondo `.sky`
y su halo radial.

### Condición

| Atributo | Acento | Acento secundario |
| --- | --- | --- |
| `clear` | Oro solar | Brasa |
| `clouds` | Gris azulado | Azul cielo |
| `rain` | Azul lluvia | Verde mar |
| `storm` | Lila eléctrico | Oro |
| `snow` | Blanco azulado | Azul hielo |
| `mist` | Gris niebla | Oro |

La condición se deriva del campo `weather[0].main` de OpenWeatherMap con
`getConditionGroup()` en `lib/format.js`.

## 5. Componentes

### Header

Emblema circular, wordmark en dos líneas, estado de conexión, selector °C/°F y
botón de instalación. En móvil se permite el wrap sin romper la jerarquía.

### Buscador

Panel con etiqueta editorial, campo tipo combobox, sugerencias con nombre y
región, botón de búsqueda y botón de geolocalización. Los recientes aparecen como
chips. Los errores viven en el mismo panel para no desplazar la página.

### WeatherHero

Panel principal con la ilustración `ConditionArt` al fondo, degradado de
legibilidad, lugar, fecha y hora local, temperatura gigante, sensación, máxima y
mínima, chips de humedad/viento/nubes y `SunArc`.

### ForecastChart

Gráfica de las próximas 36 horas:

- Línea de temperatura con área degradada.
- Barras de probabilidad de lluvia sobre la base.
- Punto activo, guía vertical y etiqueta de temperatura.
- Detalle textual de la hora seleccionada.
- Interacción con puntero, foco y teclado mediante botones superpuestos con
  `aria-pressed` y etiquetas descriptivas.

### DailyStrip

Cinco días en tarjetas desplazables. Cada tarjeta muestra día, fecha, glifo,
máxima/mínima y una barra de rango térmico normalizada contra la semana.

### Instrumentos

- **SunArc:** arco solar con progreso, amanecer, atardecer y estado de luz.
- **WindCompass:** rosa de los vientos, aguja orientada, velocidad, dirección y
  ráfagas.
- **HumidityArc:** arco de 0–100 % y punto de rocío aproximado.
- **PressureScale:** escala 950–1050 hPa con marcador y etiqueta baja/normal/alta.
- **VisibilityBar:** diez segmentos, kilómetros y lectura cualitativa.

### Instalación

- `InstallButton`: píldora dorada en el header.
- `InstallBanner`: invitación flotante, descartable durante 14 días.
- `InstallSheet`: `<dialog>` nativo con beneficios, botón de instalación o
  instrucciones para iOS/escritorio. Usa el evento `beforeinstallprompt`
  capturado temprano en `app/layout.js`.

## 6. Superficies y detalles

- Paneles con borde dorado translúcido, gradiente tinta y sombra profunda.
- Esquinas de instrumento dibujadas con `::before` y `::after` (9 × 9 px).
- Reglas finas con gradiente para separar secciones.
- Grano sutil mediante un SVG de turbulencia en `.sky::after`.
- Ningún borde o sombra dura: todo se mezcla con `color-mix` y transparencias.

## 7. Movimiento

- `rise`: entrada de paneles con desplazamiento y opacidad (640 ms).
- `drift`: sol, nubes y copos con movimiento lento e infinito.
- `rain-fall`: gotas con duración de 1.6 s y delays escalonados.
- `sheet-in`: entrada del diálogo de instalación.
- Todos los efectos se desactivan con `prefers-reduced-motion: reduce`.

## 8. Responsive

- Móvil: una columna, temperatura fluida con `clamp()`, instrumentos apilados y
  tira diaria con scroll horizontal.
- Tablet: dos columnas para instrumentos.
- Escritorio: rejilla de 12 columnas; gráfica a 8, columna lateral a 4, tira
  diaria a 12 y viento/presión a 6 + 6.
- Ancho máximo del contenido: 72 rem.
- Safe areas respetadas en el header y en los elementos flotantes.

## 9. Accesibilidad

- Skip link al contenido.
- Un solo `h1` por vista (el wordmark); secciones con `h2`.
- Combobox con `aria-expanded`, `aria-controls`, `aria-activedescendant` y
  opciones con `aria-selected`.
- Gráfica con `role="img"`, descripción general y botones de hora con etiquetas
  completas.
- Instrumentos SVG con `role="img"` y `aria-label` descriptivo.
- Foco visible dorado de 2 px con offset.
- Colores de estado acompañados siempre de texto o icono.
- Diálogo nativo con `aria-labelledby` y cierre con Escape.

## 10. PWA

- Iconos generados desde `app/assets/icons/EmblemaAtardecer.png`, sin modificar
  el original.
- Fondo tinta y anillo dorado en los iconos instalables.
- Manifest con `id`, `scope`, `display_override`, atajos y `launch_handler`.
- Service worker `weatherpwa-v3` con shell offline, estrategia de red para API y
  caché para estáticos.
- Aviso de nueva versión con `SKIP_WAITING` y recarga controlada.

## 11. Próximos pasos posibles

- Capturas reales del manifest en 1440 × 900 y 390 × 844.
- Calidad del aire y avisos meteorológicos.
- Pronóstico horario de 48 h con navegación por días.
- Selector de tema claro/oscuro editorial.
- Pruebas E2E de instalación, offline y actualización del service worker.
