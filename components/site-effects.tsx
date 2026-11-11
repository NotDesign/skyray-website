"use client";
import { useEffect, useRef } from "react";

export default function SiteEffects({ enabled, contentKey }: { enabled: boolean; contentKey: string }) {
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pointerPosition = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const progress = progressRef.current;
    let scheduled = 0;
    const update = () => {
      scheduled = 0;
      const distance = document.documentElement.scrollHeight - innerHeight;
      const value = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
      progress?.style.setProperty("--reading-progress", String(value));
      document.querySelector(".header")?.classList.toggle("has-scrolled", scrollY > 20);
    };
    const queue = () => { if (!scheduled) scheduled = requestAnimationFrame(update); };
    const observer = new ResizeObserver(queue);
    observer.observe(document.body);
    window.addEventListener("scroll", queue, { passive: true });
    update();
    return () => { cancelAnimationFrame(scheduled); observer.disconnect(); window.removeEventListener("scroll", queue); };
  }, []);
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!enabled) { elements.forEach(el => el.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("is-visible"); observer.unobserve(entry.target);
      }
    }, { threshold: .08, rootMargin: "0px 0px -20px 0px" });
    elements.forEach(el => {
      // Already-above-viewport content stays visible after a filter or language change.
      if (el.getBoundingClientRect().bottom < 0) el.classList.add("is-visible");
      else if (!el.classList.contains("is-visible")) observer.observe(el);
    });
    document.documentElement.classList.add("reveal-ready");
    return () => observer.disconnect();
  }, [enabled, contentKey]);
  useEffect(() => {
    if (!enabled) return;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let magnetic: HTMLElement | null = null, spotlight: HTMLElement | null = null;
    let effectFrame = 0;
    let pending: { target: Element | null; x: number; y: number } | null = null;
    const resetMagnet = () => { magnetic?.style.removeProperty("--mag-x"); magnetic?.style.removeProperty("--mag-y"); magnetic = null; };
    const resetSpotlight = () => {
      spotlight?.removeAttribute("data-pointer");
      spotlight?.style.removeProperty("--pointer-x");
      spotlight?.style.removeProperty("--pointer-y");
      spotlight = null;
    };
    const reset = () => { cancelAnimationFrame(effectFrame); effectFrame = 0; pending = null; resetMagnet(); resetSpotlight(); };
    const applyPointerEffects = () => {
      effectFrame = 0;
      const point = pending;
      if (!point) return;
      const target = point.target;
      if (!target || target.closest('[role="dialog"], textarea, select, input, [contenteditable="true"]')) { reset(); return; }
      const nextMagnet = target.closest<HTMLElement>("[data-magnetic]");
      const nextSpotlight = target.closest<HTMLElement>(".project-card");
      // Read geometry before any writes, and only once per animation frame.
      const magnetRect = nextMagnet?.getBoundingClientRect();
      const spotRect = nextSpotlight?.getBoundingClientRect();
      if (magnetic !== nextMagnet) resetMagnet();
      if (spotlight !== nextSpotlight) resetSpotlight();
      magnetic = nextMagnet;
      spotlight = nextSpotlight;
      if (magnetic && magnetRect) {
        magnetic.style.setProperty("--mag-x", `${Math.max(-6, Math.min(6, (point.x - magnetRect.left - magnetRect.width / 2) * .06))}px`);
        magnetic.style.setProperty("--mag-y", `${Math.max(-6, Math.min(6, (point.y - magnetRect.top - magnetRect.height / 2) * .06))}px`);
      }
      if (spotlight && spotRect) {
        if (spotlight.dataset.pointer !== "true") spotlight.dataset.pointer = "true";
        spotlight.style.setProperty("--pointer-x", `${point.x - spotRect.left}px`);
        spotlight.style.setProperty("--pointer-y", `${point.y - spotRect.top}px`);
      }
    };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType !== "mouse") { reset(); return; }
      pending = { target: event.target instanceof Element ? event.target : null, x: event.clientX, y: event.clientY };
      if (!effectFrame) effectFrame = requestAnimationFrame(applyPointerEffects);
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
    const visibility = () => { if (document.hidden) reset(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave);
    document.addEventListener("keydown", reset);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", reset, { passive: true });
    pointer.addEventListener("change", reset);
    return () => {
      reset();
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", leave);
      document.removeEventListener("keydown", reset); document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", reset); window.removeEventListener("scroll", reset);
      pointer.removeEventListener("change", reset);
    };
  }, [enabled, contentKey]);
  useEffect(() => {
    const cursor = cursorRef.current;
    const label = cursor?.querySelector("span");
    if (!cursor || !label) return;
    const root = document.documentElement;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let targetElement: Element | null = null;
    const hide = () => {
      if (cursor.dataset.visible !== "false") cursor.dataset.visible = "false";
      root.classList.remove("custom-cursor-active");
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const reset = () => { pointerPosition.current = null; hide(); };
    if (!enabled) { reset(); return; }
    const update = (target: Element | null) => {
      const position = pointerPosition.current;
      // Keep native text-entry affordances; range sliders use the DRAG cursor.
      if (!pointer.matches || !position || !target || target.closest('textarea, select, input:not([type="range"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), [contenteditable]:not([contenteditable="false"])')) {
        hide(); return;
      }
      // Match the real hit point on the next paint; no delayed chase loop.
      cursor.style.transform = `translate3d(${position.x}px,${position.y}px,0)`;
      const contextual = target.closest<HTMLElement>("[data-cursor]");
      const interactive = target.closest('button, a, input, [role="button"]');
      const kind = contextual?.dataset.cursorKind || (contextual ? "work" : interactive ? "link" : "default");
      const text = contextual?.dataset.cursor || "";
      // Context changes are infrequent; do not rebuild text on every mouse event.
      if (cursor.dataset.kind !== kind) cursor.dataset.kind = kind;
      if (label.textContent !== text) label.textContent = text;
      if (cursor.dataset.visible !== "true") cursor.dataset.visible = "true";
      if (!root.classList.contains("custom-cursor-active")) root.classList.add("custom-cursor-active");
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(targetElement); });
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { reset(); return; }
      pointerPosition.current = { x: event.clientX, y: event.clientY };
      targetElement = event.target instanceof Element ? event.target : null;
      queue();
    };
    const refresh = () => {
      const position = pointerPosition.current;
      if (position) { targetElement = document.elementFromPoint(position.x, position.y); queue(); }
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
    const visibility = () => { if (document.hidden) reset(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", move, { passive: true });
    document.addEventListener("pointerout", leave);
    document.addEventListener("keydown", reset);
    document.addEventListener("visibilitychange", visibility);
    // Scrolling changes what is under a stationary pointer, not its visibility.
    document.addEventListener("scroll", refresh, { passive: true, capture: true });
    window.addEventListener("blur", reset);
    pointer.addEventListener("change", reset);
    refresh();
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", move);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("keydown", reset);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("scroll", refresh, true);
      window.removeEventListener("blur", reset);
      pointer.removeEventListener("change", reset);
    };
  }, [enabled, contentKey]);
  useEffect(() => () => { document.documentElement.classList.remove("reveal-ready"); }, []);
  return <><div ref={progressRef} className="reading-progress" aria-hidden="true"/><div ref={cursorRef} className="context-cursor" data-visible="false" aria-hidden="true"><div className="cursor-shape"><span/></div></div></>;
}
