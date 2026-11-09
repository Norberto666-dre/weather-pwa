export default function manifest() {
  return {
    id: "/",
    name: "WeatherPWA — Almanaque del clima",
    short_name: "WeatherPWA",
    description:
      "Un almanaque del clima: busca cualquier ciudad, país o lugar, consulta el pronóstico y llévalo contigo sin conexión.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#07131c",
    theme_color: "#07131c",
    lang: "es",
    dir: "ltr",
    categories: ["weather", "utilities", "lifestyle"],
    prefer_related_applications: false,
    launch_handler: {
      client_mode: "focus-existing",
    },
    icons: [
      {
        src: "/assets/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Buscar clima",
        short_name: "Buscar",
        description: "Abrir el buscador de lugares",
        url: "/?focus=search",
        icons: [
          {
            src: "/assets/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Mi ubicación",
        short_name: "Ubicación",
        description: "Consultar el clima de tu ubicación actual",
        url: "/?locate=1",
        icons: [
          {
            src: "/assets/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
