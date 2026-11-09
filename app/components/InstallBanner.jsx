"use client";

import Image from "next/image";
import { CloseIcon, DownloadIcon } from "./weather/icons";

export default function InstallBanner({ show, onInstall, onDismiss }) {
  if (!show) return null;

  return (
    <aside
      aria-label="Instalar WeatherPWA"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-gold/30 bg-deep/95 p-3 shadow-2xl shadow-black/60 backdrop-blur sm:inset-x-auto sm:right-6"
    >
      <Image
        src="/assets/emblema-128.png"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full ring-1 ring-gold/25"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-parchment">
          Lleva el almanaque contigo
        </p>
        <p className="truncate text-xs text-muted">
          Instálala y consulta el clima sin conexión.
        </p>
      </div>

      <button
        type="button"
        onClick={onInstall}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-gold-soft"
      >
        <DownloadIcon className="h-3.5 w-3.5" />
        Instalar
      </button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Descartar invitación a instalar"
        className="shrink-0 rounded-lg p-1.5 text-muted transition hover:text-parchment"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </aside>
  );
}
