"use client";

import { useOnlineStatus } from "@/lib/pwa";
import { WifiOffIcon } from "./weather/icons";

export default function ConnectionStatus() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-deep/80 px-2.5 py-1 text-[11px] font-medium text-gold-soft"
    >
      <WifiOffIcon className="h-3.5 w-3.5" />
      Sin conexión · datos guardados
    </div>
  );
}
