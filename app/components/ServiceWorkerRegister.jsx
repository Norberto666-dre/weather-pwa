"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshIcon } from "./weather/icons";

export default function ServiceWorkerRegister() {
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const shouldReloadRef = useRef(false);

  useEffect(() => {
    // El service worker solo se registra en producción para no interferir
    // con el hot reload de `next dev`.
    if (process.env.NODE_ENV !== "production") return undefined;
    if (!("serviceWorker" in navigator)) return undefined;

    let disposed = false;

    const watchWorker = (worker) => {
      if (!worker) return;

      const handleState = () => {
        if (disposed) return;
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setUpdateReady(true);
        }
      };

      worker.addEventListener("statechange", handleState);
      handleState();
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        if (disposed) return;

        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }

        watchWorker(registration.installing);
        registration.addEventListener("updatefound", () => {
          watchWorker(registration.installing);
        });

        navigator.serviceWorker.ready
          .then(() => navigator.storage?.persist?.())
          .catch(() => {});
      } catch (error) {
        console.error("No se pudo registrar el service worker:", error);
      }
    };

    const handleControllerChange = () => {
      if (shouldReloadRef.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
      window.removeEventListener("load", register);
    };
  }, []);

  const applyUpdate = () => {
    shouldReloadRef.current = true;
    navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
    setUpdateReady(false);
  };

  if (!updateReady || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-gold/40 bg-deep/95 p-3 pl-4 shadow-2xl shadow-black/60 backdrop-blur sm:inset-x-auto sm:right-6"
    >
      <RefreshIcon className="h-5 w-5 shrink-0 text-gold" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-parchment">
          Nueva versión disponible
        </p>
        <p className="text-xs text-muted">
          Actualiza para ver los últimos cambios.
        </p>
      </div>

      <button
        type="button"
        onClick={applyUpdate}
        className="shrink-0 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-gold-soft"
      >
        Actualizar
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Descartar aviso de actualización"
        className="shrink-0 rounded-lg p-1.5 text-muted transition hover:text-parchment"
      >
        <span aria-hidden className="text-sm">
          ✕
        </span>
      </button>
    </div>
  );
}
