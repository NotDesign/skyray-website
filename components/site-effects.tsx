"use client";
import { useEffect, useRef } from "react";

export default function SiteEffects({ enabled, contentKey }: { enabled: boolean; contentKey: string }) {
  const progressRef = useRef<HTMLDivElement>(null);
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
    const resetMagnet = () => { magnetic?.style.removeProperty("--mag-x"); magnetic?.style.removeProperty("--mag-y"); magnetic = null; };
    const resetSpotlight = () => {
      spotlight?.removeAttribute("data-pointer");
      spotlight?.style.removeProperty("--pointer-x");
      spotlight?.style.removeProperty("--pointer-y");
      spotlight = null;
    };
    const reset = () => { resetMagnet(); resetSpotlight(); };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType !== "mouse") { reset(); return; }
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest('[role="dialog"], textarea, select, input, [contenteditable="true"]')) { reset(); return; }
      const nextMagnet = target.closest<HTMLElement>("[data-magnetic]");
      if (magnetic !== nextMagnet) resetMagnet();
      magnetic = nextMagnet;
      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        magnetic.style.setProperty("--mag-x", `${Math.max(-10,Math.min(10,(event.clientX - rect.left - rect.width / 2) * .12))}px`);
        magnetic.style.setProperty("--mag-y", `${Math.max(-10,Math.min(10,(event.clientY - rect.top - rect.height / 2) * .12))}px`);
      }
      const nextSpotlight = target.closest<HTMLElement>(".project-card");
      if (spotlight !== nextSpotlight) resetSpotlight();
      spotlight = nextSpotlight;
      if (spotlight) {
        const rect = spotlight.getBoundingClientRect();
        spotlight.dataset.pointer = "true";
        spotlight.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        spotlight.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      }
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
  useEffect(() => () => { document.documentElement.classList.remove("reveal-ready"); }, []);
  return <div ref={progressRef} className="reading-progress" aria-hidden="true"/>;
}
