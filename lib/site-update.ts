const UPDATE_PARAM = "__skyray_update";
const POSITION_KEY = "skyray-update-position";
const VERSION = /^[a-f0-9]{64}$/;

export function hasUnfinishedInquiry(doc: Document) {
  return [...doc.querySelectorAll<HTMLFormElement>('.inquiry-form:not([data-update-safe="true"])')].some(form =>
    [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input,textarea,select")].some(field => {
      if (field.tagName === "SELECT") {
        const select = field as HTMLSelectElement;
        return select.value !== [...select.options].find(option => option.defaultSelected)?.value;
      }
      return field.value.trim() !== "";
    }),
  );
}

export function startSiteUpdates(version: string, base: string, win = window, doc = document) {
  let stopped = false, fetching = false, navigating = false, pending = "", retry = 0;
  let lastCheck = -Infinity, lastInteraction = Date.now();
  const address = new URL(win.location.href);
  // Keep a failed target in the URL to prevent refresh loops if a CDN edge is stale.
  const attempted = address.searchParams.get(UPDATE_PARAM);
  const restore = () => {
    if (stopped || attempted !== version) return;
    address.searchParams.delete(UPDATE_PARAM);
    win.history.replaceState(win.history.state, "", address.href);
    try {
      const saved = JSON.parse(win.sessionStorage.getItem(POSITION_KEY) || "null");
      win.sessionStorage.removeItem(POSITION_KEY);
      if (saved?.version === version && saved.path === address.pathname + address.search + address.hash && Date.now() - saved.time < 120_000 && Number.isFinite(saved.y)) {
        win.scrollTo({ top: Math.max(0, saved.y), behavior: "instant" });
      }
    } catch { /* Storage can be unavailable in private browsing. */ }
  };
  if (doc.readyState === "complete") win.setTimeout(restore, 0);
  else win.addEventListener("load", restore, { once: true });

  function applyUpdate() {
    win.clearTimeout(retry);
    if (stopped || navigating || !pending) return;
    if (doc.visibilityState !== "visible" || Date.now() - lastInteraction < 3000 ||
        doc.querySelector('[role="dialog"], .nav.open') ||
        doc.activeElement?.matches('input, textarea, select, [contenteditable="true"]') || hasUnfinishedInquiry(doc)) {
      retry = win.setTimeout(applyUpdate, 5000);
      return;
    }
    const next = new URL(win.location.href);
    next.searchParams.delete(UPDATE_PARAM);
    try {
      win.sessionStorage.setItem(POSITION_KEY, JSON.stringify({ version: pending, path: next.pathname + next.search + next.hash, y: win.scrollY, time: Date.now() }));
    } catch { /* Refresh still works without storage; only position restoration is skipped. */ }
    next.searchParams.set(UPDATE_PARAM, pending);
    navigating = true;
    win.location.replace(next.href);
  }
  async function check() {
    if (stopped || navigating || fetching || doc.visibilityState !== "visible" || win.navigator.onLine === false || Date.now() - lastCheck < 10_000) return;
    fetching = true;
    lastCheck = Date.now();
    const controller = new AbortController();
    const timeout = win.setTimeout(() => controller.abort(), 10_000);
    try {
      const url = new URL(`${base}version.json`, win.location.origin);
      url.searchParams.set("t", String(lastCheck));
      const response = await win.fetch(url.href, { cache: "no-store", signal: controller.signal });
      if (!response.ok) return;
      const release: unknown = await response.json();
      const latest = (release as { version?: unknown } | null)?.version;
      if (stopped || typeof latest !== "string" || !VERSION.test(latest)) return;
      pending = latest !== version && latest !== attempted ? latest : "";
      applyUpdate();
    } catch { /* Offline/error responses leave the current working page intact. */ }
    finally { win.clearTimeout(timeout); fetching = false; }
  }
  const interact = () => { lastInteraction = Date.now(); };
  const resume = () => { void check(); };
  const events = ["pointerdown", "keydown", "input", "scroll"] as const;
  events.forEach(name => win.addEventListener(name, interact, { passive: true, capture: true }));
  win.addEventListener("focus", resume);
  win.addEventListener("pageshow", resume);
  win.addEventListener("online", resume);
  doc.addEventListener("visibilitychange", resume);
  const interval = win.setInterval(resume, 60_000);
  void check();
  return () => {
    stopped = true;
    win.clearInterval(interval); win.clearTimeout(retry);
    win.removeEventListener("load", restore);
    events.forEach(name => win.removeEventListener(name, interact, true));
    win.removeEventListener("focus", resume); win.removeEventListener("pageshow", resume); win.removeEventListener("online", resume);
    doc.removeEventListener("visibilitychange", resume);
  };
}
