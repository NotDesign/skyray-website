"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** A single shared hero bridges the footer to the beginning without growing the DOM. */
export default function PageLoop({ enabled, blocked, children }: {
  enabled: boolean; blocked: boolean; children: ReactNode;
}) {
  const tailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tail = tailRef.current;
    const hero = document.getElementById("hero");
    if (!enabled || blocked || !tail || !hero) return;
    let frame = 0, revealFrame = 0, near = false, previousY = window.scrollY;
    let downwardIntent = false, touchY = 0;
    const wrap = () => {
      frame = 0;
      const currentY = window.scrollY;
      const downward = currentY > previousY || downwardIntent;
      downwardIntent = false;
      previousY = currentY;
      if (!downward || !near || document.hidden) return;
      const headerHeight = document.querySelector(".header")?.getBoundingClientRect().height ?? 88;
      const tailTop = tail.getBoundingClientRect().top;
      if (tailTop > headerHeight) return;
      const heroTop = hero.getBoundingClientRect().top + currentY;
      const destination = Math.max(0, heroTop - tailTop);
      window.scrollTo({ top: destination, behavior: "instant" });
      previousY = destination;
      // The original hero and its continuation occupy the same screen coordinates.
      // Synchronize reveal state before paint rather than replaying a hidden frame.
      hero.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom > headerHeight && rect.top < innerHeight) {
          element.style.transition = "none";
          element.classList.add("is-visible");
          element.dataset.revealSide = "below";
        }
      });
      revealFrame = requestAnimationFrame(() => {
        hero.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => element.style.removeProperty("transition"));
      });
      tail.dataset.cycles = String(Number(tail.dataset.cycles || 0) + 1);
    };
    const queue = () => {
      if (near && !frame) frame = requestAnimationFrame(wrap);
      else if (!near) previousY = window.scrollY;
    };
    const wheel = (event: WheelEvent) => {
      if (near && event.deltaY > 0 && !event.ctrlKey) { downwardIntent = true; queue(); }
    };
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const touchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      if (near && y < touchY) { downwardIntent = true; queue(); }
      touchY = y;
    };
    const observer = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) queue();
    }, { rootMargin: "100% 0px" });
    observer.observe(tail);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(revealFrame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      hero.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => element.style.removeProperty("transition"));
    };
  }, [enabled, blocked]);
  return <div ref={tailRef} className="page-loop" hidden={!enabled}>{children}</div>;
}
