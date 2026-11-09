"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const DISMISS_KEY = "weatherpwa:install-dismissed";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

function subscribeStore(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function hasWindow() {
  return typeof window !== "undefined";
}

function getPromptEvent() {
  return hasWindow() ? window.__weatherPwaPrompt ?? null : null;
}

function getCanPrompt() {
  return Boolean(getPromptEvent());
}

function getInstalled() {
  if (!hasWindow()) return false;

  return Boolean(
    window.__weatherPwaInstalled ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
  );
}

function getIsIos() {
  if (!hasWindow()) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1)
  );
}

function getOnline() {
  return hasWindow() ? window.navigator.onLine : true;
}

function getDismissed() {
  if (!hasWindow()) return false;

  try {
    const timestamp = Number(window.localStorage.getItem(DISMISS_KEY));
    return Number.isFinite(timestamp) && Date.now() - timestamp < DISMISS_MS;
  } catch {
    return false;
  }
}

function getServerFalse() {
  return false;
}

function getServerTrue() {
  return true;
}

function subscribeBrowser(callback) {
  if (!hasWindow()) return () => {};

  const handleChange = () => callback();
  const media = window.matchMedia("(display-mode: standalone)");

  window.addEventListener("pwa:install-available", handleChange);
  window.addEventListener("pwa:installed", handleChange);
  window.addEventListener("pwa:install-dismissed", handleChange);
  window.addEventListener("online", handleChange);
  window.addEventListener("offline", handleChange);
  media.addEventListener?.("change", handleChange);

  return () => {
    window.removeEventListener("pwa:install-available", handleChange);
    window.removeEventListener("pwa:installed", handleChange);
    window.removeEventListener("pwa:install-dismissed", handleChange);
    window.removeEventListener("online", handleChange);
    window.removeEventListener("offline", handleChange);
    media.removeEventListener?.("change", handleChange);
  };
}

/**
 * Estado del instalador PWA: disponibilidad, instalación y descarte.
 * El evento beforeinstallprompt se guarda en un script temprano del layout.
 */
export function usePwaInstall() {
  const canInstall = useSyncExternalStore(
    subscribeBrowser,
    getCanPrompt,
    getServerFalse
  );
  const isInstalled = useSyncExternalStore(
    subscribeBrowser,
    getInstalled,
    getServerFalse
  );
  const isIos = useSyncExternalStore(subscribeBrowser, getIsIos, getServerFalse);
  const isDismissed = useSyncExternalStore(
    subscribeBrowser,
    getDismissed,
    getServerFalse
  );

  useEffect(() => {
    const capture = (event) => {
      event.preventDefault();
      window.__weatherPwaPrompt = event;
      emit();
    };

    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  const install = useCallback(async () => {
    const promptEvent = getPromptEvent();

    if (!promptEvent) return "unavailable";

    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      window.__weatherPwaPrompt = null;
      emit();
      return choice?.outcome || "dismissed";
    } catch {
      window.__weatherPwaPrompt = null;
      emit();
      return "unavailable";
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Sin persistencia disponible.
    }
    emit();
  }, []);

  return { canInstall, isInstalled, isIos, isDismissed, install, dismiss };
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribeBrowser, getOnline, getServerTrue);
}
