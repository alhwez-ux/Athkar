(() => {
  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isIos = () => {
    const ua = window.navigator.userAgent || "";
    return (
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    window.dispatchEvent(new Event("athkar-install-available"));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event("athkar-installed"));
  });

  window.athkarPwa = {
    canInstall: () => Boolean(deferredPrompt) && !isStandalone(),
    isInstalled: () => isStandalone(),
    isIos: () => isIos() && !isStandalone(),
    install: async () => {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return choice.outcome === "accepted";
    }
  };
})();
