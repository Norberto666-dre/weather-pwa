import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

export const metadata = {
  title: "WeatherPWA — Almanaque del clima",
  description:
    "Un almanaque del clima: busca cualquier ciudad, país o lugar, consulta el pronóstico y llévalo contigo sin conexión.",
  applicationName: "WeatherPWA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WeatherPWA",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#07131c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Captura temprana del evento de instalación para no perderlo antes de hidratar.
const installCapture = `
(function () {
  window.__weatherPwaPrompt = null;
  window.__weatherPwaInstalled = false;

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    window.__weatherPwaPrompt = event;
    window.dispatchEvent(new Event("pwa:install-available"));
  });

  window.addEventListener("appinstalled", function () {
    window.__weatherPwaInstalled = true;
    window.__weatherPwaPrompt = null;
    window.dispatchEvent(new Event("pwa:installed"));
  });
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: installCapture }} />
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
