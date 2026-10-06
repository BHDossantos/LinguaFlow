"use client";
import { useEffect, useState } from "react";

// A subtle, dismissible "install this app" banner.
// - Android/desktop Chrome/Edge: captures the beforeinstallprompt event and
//   installs natively on tap.
// - iOS Safari (no beforeinstallprompt): shows the Add to Home Screen hint.
// Hidden when already installed (standalone), inside the Capacitor shell
// (NoeliaApp UA), or after the person installs or dismisses it.

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "noelia_install_dismissed_v1";

function isStandalone(): boolean {
  try {
    return (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as any).standalone === true
    );
  } catch {
    return false;
  }
}

function isNativeShell(): boolean {
  try {
    return /NoeliaApp/.test(navigator.userAgent);
  } catch {
    return false;
  }
}

function isIos(): boolean {
  try {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // Never show inside the native app or once installed.
    if (isNativeShell() || isStandalone()) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem(DISMISS_KEY) === "1"; } catch {}
    if (dismissed) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const onInstalled = () => { setShow(false); setDeferred(null); try { localStorage.setItem(DISMISS_KEY, "1"); } catch {} };
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt — show the manual hint after a beat,
    // but only in Safari (standalone-capable) and only once.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) {
      iosTimer = setTimeout(() => { setIosHint(true); setShow(true); }, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
  }

  async function install() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Noelia"
      className="fixed inset-x-0 bottom-20 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-[#171a2e] lg:bottom-6"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-lg font-extrabold text-white">
          N
        </span>
        <div className="min-w-0 flex-1">
          {iosHint ? (
            <>
              <p className="text-sm font-semibold">Install Noelia</p>
              <p className="mt-0.5 text-xs text-ink-500">
                Tap the Share button, then <span className="font-medium">Add to Home Screen</span> to install the app.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Install the Noelia app</p>
              <p className="mt-0.5 text-xs text-ink-500">
                Add it to your home screen for a full-screen, offline-ready experience.
              </p>
            </>
          )}
          <div className="mt-2 flex items-center gap-2">
            {!iosHint && (
              <button onClick={install} className="btn-primary px-3 py-1.5 text-xs">
                Install
              </button>
            )}
            <button onClick={dismiss} className="text-xs text-ink-500 hover:text-ink-700">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-ink-400 hover:text-ink-600">
          ✕
        </button>
      </div>
    </div>
  );
}
