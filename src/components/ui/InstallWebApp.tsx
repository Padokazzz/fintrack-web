import { useState, useSyncExternalStore } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { useLanguage } from "../../lib/i18n/useLanguage";

interface InstallPrompt extends Event {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
}

const web = typeof window !== "undefined" && !isTauri();
const standalone = web && window.matchMedia?.("(display-mode: standalone)");
const ios = web && (/iPad|iPhone|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const android = web && /Android/i.test(navigator.userAgent);
let prompt: InstallPrompt | null = null;
let installed = false;
const listeners = new Set<() => void>();

function update() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function snapshot() {
  if (!web || installed || (standalone && standalone.matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone) return "hidden";
  if (prompt) return "prompt";
  if (ios) return "ios";
  return android ? "android" : "hidden";
}

if (web) {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    prompt = event as InstallPrompt;
    update();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    prompt = null;
    update();
  });
  if (standalone) standalone.addEventListener("change", update);
}

export function InstallWebApp({ className = "" }: { className?: string }) {
  const { locale } = useLanguage();
  const pt = locale.startsWith("pt");
  const mode = useSyncExternalStore(subscribe, snapshot, () => "hidden");
  const [showSteps, setShowSteps] = useState(false);

  async function install() {
    if (!prompt) {
      setShowSteps((visible) => !visible);
      return;
    }

    const request = prompt;
    prompt = null;
    try {
      installed = (await request.prompt()).outcome === "accepted" || installed;
    } catch {
      setShowSteps(true);
    } finally {
      update();
    }
  }

  if (mode === "hidden") return null;
  const steps = mode === "ios"
    ? (pt ? "No Safari, toque em Compartilhar → Adicionar à Tela de Início → Adicionar. Ative Abrir como App da Web se essa opção aparecer."
      : "In Safari, tap Share → Add to Home Screen → Add. Turn on Open as Web App if shown.")
    : (pt ? "No menu do navegador, toque em Instalar app ou Adicionar à tela inicial."
      : "In your browser menu, tap Install app or Add to Home screen.");

  return (
    <div className={`text-sm ${className}`}>
      <button type="button" onClick={install} aria-expanded={mode === "prompt" ? undefined : showSteps}
        className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700">
        {pt ? "Instalar FinTrack" : "Install FinTrack"}
      </button>
      {showSteps && <p className="mt-2 max-w-sm text-slate-600">{steps}</p>}
    </div>
  );
}
