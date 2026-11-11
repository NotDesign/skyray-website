/// <reference path="../types/lottie-light.d.ts" />
"use client";
import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

/** A recognizable cloud opening lets silver-blue light through: sky + ray. */
export default function SkyRayMotion({ paused, className = "" }: { paused: boolean; className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const playerRef = useRef<HTMLSpanElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current, container = playerRef.current;
    if (!root || !container) return;
    let animation: AnimationItem | null = null;
    let disposed = false, loading = false, failed = false, near = false, visible = false, loaded = false;
    const controller = new AbortController();
    const setStatus = (value: string) => {
      if (root.dataset.motionState !== value) root.dataset.motionState = value;
    };
    const sync = () => {
      if (disposed) return;
      if (!animation) {
        if (near && !pausedRef.current && !document.hidden && !loading && !failed) void load();
        return;
      }
      if (!loaded) return;
      if (visible && !pausedRef.current && !document.hidden) {
        animation.play();
        setStatus("playing");
      } else {
        animation.pause();
        setStatus("paused");
      }
    };
    const load = async () => {
      loading = true;
      try {
        const [{ default: lottie }, response] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch(`${import.meta.env.BASE_URL}animations/skyray-ray.json`, { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error("Animation unavailable");
        const animationData = await response.json();
        if (disposed) return;
        animation = lottie.loadAnimation({ container, renderer: "svg", loop: true, autoplay: false, animationData });
        animation.setSubframe(false);
        const onReady = () => {
          if (disposed || !animation) return;
          loaded = true;
          // Start from an established motif, with the static drawing covering load time.
          animation.goToAndStop(72, true);
          root.dataset.renderer = "lottie-svg";
          setReady(true);
          sync();
        };
        animation.addEventListener("DOMLoaded", onReady);
      } catch {
        if (!disposed) { failed = true; setStatus("static"); }
      }
    };
    const nearObserver = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      sync();
    }, { rootMargin: "200px" });
    const visibleObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .01 });
    nearObserver.observe(root);
    visibleObserver.observe(root);
    document.addEventListener("visibilitychange", sync);
    syncRef.current = sync;
    return () => {
      disposed = true;
      controller.abort();
      nearObserver.disconnect();
      visibleObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      syncRef.current = () => {};
      animation?.destroy();
    };
  }, []);

  useEffect(() => { pausedRef.current = paused; syncRef.current(); }, [paused]);

  return <span ref={rootRef} className={`sky-ray-motion ${className}`} aria-hidden="true" data-renderer="static-svg" data-motion-state="static" style={{ display: "block", position: "relative", width: "100%", height: "100%" }}>
    <svg viewBox="0 0 200 200" fill="none" style={{ display: "block", width: "100%", height: "100%", visibility: ready ? "hidden" : "visible" }}>
      <path d="M98 118H128L176 179H112Z" fill="#b8dcf2" opacity=".12"/>
      <g strokeLinecap="round">
        <path d="M99 124L112 177" stroke="#b8dcf2" strokeWidth="1.7" opacity=".68"/>
        <path d="M112 124L143 177" stroke="#eef3f7" strokeWidth="2.2" opacity=".95"/>
        <path d="M126 124L176 177" stroke="#b8dcf2" strokeWidth="1.7" opacity=".65"/>
        <path d="M42 114C25 114 19 99 27 88C32 80 41 77 50 79C52 59 69 49 84 55C95 30 131 37 137 62C159 56 181 75 177 94C176 106 166 114 153 114M42 114H94M132 114H153" stroke="#eef3f7" strokeWidth="2.4" opacity=".92"/>
      </g>
    </svg>
    <span ref={playerRef} style={{ position: "absolute", inset: 0, display: "block" }}/>
  </span>;
}
