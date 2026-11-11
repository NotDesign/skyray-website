"use client";
import { useEffect, useRef } from "react";

// A small, deterministic fractal texture is generated once, then composited.
// No per-frame noise generation, external textures, video or audio.
function cloudTexture() {
  const size = 256;
  const texture = document.createElement("canvas");
  texture.width = texture.height = size;
  const context = texture.getContext("2d");
  if (!context) return texture;
  const pixels = context.createImageData(size, size);
  const lattice = new Float32Array(64 * 64);
  let seed = 34271;
  for (let i = 0; i < lattice.length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    lattice[i] = seed / 4294967296;
  }
  const smooth = (v: number) => v * v * (3 - 2 * v);
  const noise = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
    const at = (a: number, b: number) => lattice[(a & 63) + (b & 63) * 64];
    const top = at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx;
    const bottom = at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let value = 0, amplitude = .55;
    for (let octave = 0; octave < 6; octave++) {
      const scale = 3 * 2 ** octave;
      value += noise(x / size * scale + octave * 7, y / size * scale + octave * 3) * amplitude;
      amplitude *= .49;
    }
    const radius = Math.hypot((x / size - .5) * 2, (y / size - .5) * 2);
    const edge = Math.max(0, 1 - smooth(Math.min(1, radius)));
    const density = Math.max(0, value - .32) ** 1.25 * edge;
    const i = (y * size + x) * 4;
    pixels.data[i] = 148; pixels.data[i + 1] = 187; pixels.data[i + 2] = 224;
    pixels.data[i + 3] = Math.min(255, density * 440);
  }
  context.putImageData(pixels, 0, 0);
  return texture;
}

export default function DigitalFog({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const texture = textureRef.current ?? (textureRef.current = cloudTexture());
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = 0, height = 0, frame = 0, visible = true, last = 0;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    let pageLeft = 0, pageTop = 0;
    let pointer: { x: number; y: number } | null = null;
    const animate = !paused;
    const paint = () => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      const time = timeRef.current;
      for (let i = 0; i < 5; i++) {
        // Different drift rates and breathing scales make depth visible without
        // adding draw calls or enlarging the bounded backing surface.
        const drift = time * (.21 + i * .035);
        const breath = 1 + Math.sin(time * .24 + i * 1.7) * .09;
        const x = width * (.04 + i * .26) + Math.sin(drift + i * 2.1) * width * .16 + pointerX * (i + 1) * 9;
        const y = height * (.4 + (i % 2) * .16) + Math.cos(time * (.18 + i * .018) + i) * height * .1 + pointerY * (i + 1) * 5;
        const w = Math.max(500, width * .78) * breath, h = Math.max(250, height * .65) / breath;
        context.save();
        context.translate(x, y);
        context.rotate(-.12 + Math.sin(time * .12 + i) * .1);
        context.globalAlpha = (finePointer.matches ? .6 : .46) * (.88 + .12 * Math.sin(time * .3 + i));
        context.drawImage(texture, -w / 2, -h / 2, w, h);
        context.restore();
      }
    };
    const tick = (now: number) => {
      frame = 0;
      if (!animate || !visible || document.hidden) return;
      const interval = finePointer.matches ? 1000 / 30 : 1000 / 20;
      if (now - last >= interval) {
        timeRef.current += Math.min((now - (last || now)) / 1000, .06);
        last = now;
        pointerX += (targetX - pointerX) * .06;
        pointerY += (targetY - pointerY) * .06;
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (animate && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const updateTarget = () => {
      if (!pointer || !animate || !visible || !finePointer.matches) return;
      // Page coordinates keep the cached bounds valid while the page scrolls.
      targetX = Math.max(-1, Math.min(1, (pointer.x + scrollX - pageLeft) / width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (pointer.y + scrollY - pageTop) / height * 2 - 1));
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      pageLeft = bounds.left + scrollX; pageTop = bounds.top + scrollY;
      const nextWidth = Math.max(1, bounds.width), nextHeight = Math.max(1, bounds.height);
      if (width === nextWidth && height === nextHeight) { updateTarget(); return; }
      width = nextWidth; height = nextHeight;
      // Soft fog needs no high-DPR surface. Bound the five blended layers while
      // keeping their geometry and motion in CSS pixels at every viewport size.
      const scale = Math.min(1, 960 / width, 440 / height);
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      updateTarget();
      paint();
    };
    const move = (event: PointerEvent) => {
      if (!animate || !visible || !finePointer.matches || event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      updateTarget();
    };
    const leave = () => { pointer = null; targetX = 0; targetY = 0; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas); observer.observe(canvas);
    const hero = canvas.closest(".hero");
    hero?.addEventListener("pointermove", move as EventListener, { passive: true });
    hero?.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", updateTarget, { passive: true });
    document.addEventListener("visibilitychange", resume);
    resize(); resume();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      hero?.removeEventListener("pointermove", move as EventListener);
      hero?.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", updateTarget);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [paused]);
  return <div className="digital-fog" aria-hidden="true"><div className="sky-light"/><canvas ref={canvasRef}/><div className="sky-horizon"/></div>;
}
