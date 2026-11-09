"use client";

import { CheckIcon, DownloadIcon, ShareIcon } from "./weather/icons";

export default function InstallButton({
  canInstall,
  isInstalled,
  isIos,
  onClick,
  compact = false,
}) {
  const label = isInstalled
    ? "Instalada"
    : canInstall
      ? "Instalar app"
      : isIos
        ? "Añadir a inicio"
        : "Instalar app";

  const Glyph = isInstalled ? CheckIcon : isIos ? ShareIcon : DownloadIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={isInstalled ? "Aplicación instalada" : "Instalar WeatherPWA"}
      className={[
        "group inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
        isInstalled
          ? "border-success/35 bg-success/10 text-success"
          : "border-gold/35 bg-gold/10 text-gold-soft hover:border-gold/60 hover:bg-gold/15",
      ].join(" ")}
    >
      <Glyph className="h-4 w-4" />
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{label}</span>
    </button>
  );
}
