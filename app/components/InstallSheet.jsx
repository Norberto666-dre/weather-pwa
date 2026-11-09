"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  MoreIcon,
  ShareIcon,
  SparkIcon,
  WifiOffIcon,
} from "./weather/icons";

const BENEFITS = [
  {
    icon: WifiOffIcon,
    title: "Funciona sin conexión",
    body: "El último reporte y el shell de la app quedan guardados.",
  },
  {
    icon: SparkIcon,
    title: "Se abre como una app",
    body: "Sin barra de navegador, con su propio icono y ventana.",
  },
  {
    icon: DownloadIcon,
    title: "Siempre a la mano",
    body: "Acceso directo desde tu inicio, dock o menú de aplicaciones.",
  },
];

export default function InstallSheet({
  open,
  onClose,
  canInstall,
  isInstalled,
  isIos,
  install,
  dismiss,
}) {
  const ref = useRef(null);
  const [status, setStatus] = useState("idle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    setStatus("idle");
    onClose();
  };

  const handleInstall = async () => {
    setBusy(true);
    const result = await install();
    setBusy(false);
    setStatus(result);
  };

  const handleDismiss = () => {
    dismiss();
    handleClose();
  };

  const success = isInstalled || status === "accepted";

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="install-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) handleClose();
      }}
    >
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar instalación"
          className="absolute right-4 top-4 rounded-lg p-2 text-muted transition hover:bg-white/5 hover:text-parchment"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <Image
            src="/assets/emblema.png"
            alt=""
            width={64}
            height={64}
            className="h-14 w-14 rounded-full ring-1 ring-gold/30"
          />
          <div>
            <p className="label text-gold">WeatherPWA</p>
            <p className="mt-1 text-sm text-muted">Almanaque del clima</p>
          </div>
        </div>

        <h2
          id="install-title"
          className="mt-5 font-display text-2xl leading-tight text-parchment sm:text-3xl"
        >
          {success ? "El emblema ya vive en tu pantalla" : "Lleva el almanaque contigo"}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          {success
            ? "La app quedó instalada. Ábrela desde su icono para consultar el clima incluso sin conexión."
            : "Instálala en segundos. No hay tienda, no hay cuenta y no ocupa casi nada."}
        </p>

        {success ? (
          <div
            role="status"
            className="mt-5 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
          >
            <CheckIcon className="h-5 w-5 shrink-0" />
            Instalación lista. Puedes cerrar esta ventana.
          </div>
        ) : (
          <>
            <ul className="mt-5 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold/20 bg-gold/10 text-gold">
                    <benefit.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-parchment">
                      {benefit.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted">
                      {benefit.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {canInstall ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-ink transition hover:bg-gold-soft disabled:cursor-wait disabled:opacity-70"
              >
                <DownloadIcon className="h-4 w-4" />
                {busy ? "Abriendo instalador…" : "Instalar ahora"}
              </button>
            ) : (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-parchment">
                  Instalación manual
                </p>

                {isIos ? (
                  <ol className="mt-2 space-y-2 text-xs leading-relaxed text-muted">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-gold">1.</span>
                      Toca <ShareIcon className="mx-0.5 inline h-3.5 w-3.5 text-parchment" />{" "}
                      <span className="text-parchment">Compartir</span> en Safari.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-gold">2.</span>
                      Elige <span className="text-parchment">Añadir a pantalla de inicio</span>.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-gold">3.</span>
                      Confirma con <span className="text-parchment">Añadir</span>.
                    </li>
                  </ol>
                ) : (
                  <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted">
                    <MoreIcon className="mt-0.5 h-4 w-4 shrink-0 text-parchment" />
                    <span>
                      Abre el menú de tu navegador y elige{" "}
                      <span className="text-parchment">Instalar aplicación</span> o{" "}
                      <span className="text-parchment">Añadir a pantalla de inicio</span>.
                      En Chrome y Edge también aparece un icono de instalación en la barra
                      de direcciones.
                    </span>
                  </p>
                )}
              </div>
            )}

            {status === "dismissed" ? (
              <p role="status" className="mt-3 text-center text-xs text-muted">
                Instalación cancelada. Puedes intentarlo de nuevo desde el botón
                del encabezado.
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-muted transition hover:text-parchment"
              >
                Ahora no
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
