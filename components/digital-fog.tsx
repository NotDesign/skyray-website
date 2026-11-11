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
    let width = 1, height = 1, frame = 0, visible = true, last = 0;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    const animate = !paused;
    const paint = () => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      const time = timeRef.current;
      for (let i = 0; i < 5; i++) {
        const x = width * (.04 + i * .26) + Math.sin(time * .15 + i * 2.1) * width * .09 + pointerX * (i + 1) * 5;
        const y = height * (.4 + (i % 2) * .16) + Math.cos(time * .12 + i) * height * .06 + pointerY * (i + 1) * 3;
        const w = Math.max(500, width * .8), h = Math.max(250, height * .65);
        context.save();
        context.translate(x, y);
        context.rotate(-.12 + Math.sin(time * .06 + i) * .06);
        context.globalAlpha = finePointer.matches ? .52 : .4;
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
        pointerX += (targetX - pointerX) * .045;
        pointerY += (targetY - pointerY) * .045;
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (animate && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.min(devicePixelRatio || 1, 1.25);
      width = bounds.width; height = bounds.height;
      canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      paint();
    };
    const move = (event: PointerEvent) => {
      if (!animate || !finePointer.matches || event.pointerType !== "mouse") return;
      const bounds = canvas.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    };
    const leave = () => { targetX = 0; targetY = 0; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas); observer.observe(canvas);
    const hero = canvas.closest(".hero");
    hero?.addEventListener("pointermove", move as EventListener);
    hero?.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", resume);
    resize(); resume();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      hero?.removeEventListener("pointermove", move as EventListener);
      hero?.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [paused]);
  return <div className="digital-fog" aria-hidden="true"><div className="sky-light"/><canvas ref={canvasRef}/><div className="sky-horizon"/></div>;
}
