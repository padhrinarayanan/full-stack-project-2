import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GRADE_ORDER } from "../utils/grading";
import type { GradeLetter } from "../types";

const HEX: Record<GradeLetter, string> = {
  "A+": "#059669",
  A: "#22c55e",
  B: "#0ea5e9",
  C: "#f59e0b",
  D: "#f97316",
  E: "#78716c",
  F: "#f43f5e",
};

function letterTexture(text: string, fg: string, bg: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = fg;
  ctx.font = "600 62px ui-monospace, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Real-time 3D bar chart of the grade distribution.
 * `counts` is ordered like GRADE_ORDER (A+ ... F) and animates smoothly when it changes.
 */
export default function HeroScene({ counts }: { counts: number[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetsRef = useRef<number[]>(counts);

  useEffect(() => {
    targetsRef.current = counts;
  }, [counts]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL unavailable – the hero still works without the scene
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const lookAt = new THREE.Vector3(0, 1.5, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 8, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x34d399, 60, 25);
    rim.position.set(-6, 3, -2);
    scene.add(rim);
    const warm = new THREE.PointLight(0xfbbf24, 25, 25);
    warm.position.set(6, 2, 3);
    scene.add(warm);

    /* ----- chart ----- */
    const chart = new THREE.Group();
    scene.add(chart);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.24, 2.3),
      new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.55, metalness: 0.35 })
    );
    base.position.y = -0.12;
    chart.add(base);

    const bars: THREE.Mesh[] = [];
    GRADE_ORDER.forEach((g, i) => {
      const x = -3.6 + i * 1.2;
      const geo = new THREE.BoxGeometry(0.82, 1, 0.82);
      geo.translate(0, 0.5, 0); // pivot at the bottom so scale.y grows upward
      const bar = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: HEX[g], roughness: 0.3, metalness: 0.2 })
      );
      bar.position.set(x, 0, -0.1);
      bar.scale.y = 0.01;
      chart.add(bar);
      bars.push(bar);

      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 0.62),
        new THREE.MeshBasicMaterial({ map: letterTexture(g, "#fafaf9", "#1c1917") })
      );
      label.rotation.x = -Math.PI / 2;
      label.position.set(x, 0.005, 0.78);
      chart.add(label);
    });

    /* ----- floating letter cubes ----- */
    const floaters: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }[] = [];
    const layout: [GradeLetter, number, number, number, number][] = [
      ["A+", -4.3, 3.9, -1.2, 0.36],
      ["B", 4.4, 4.3, -1.6, 0.3],
      ["A", -1.6, 5.0, -2.4, 0.26],
      ["C", 2.2, 3.7, 0.4, 0.22],
      ["F", -4.9, 1.9, 1.0, 0.2],
      ["D", 4.9, 2.2, 1.2, 0.24],
    ];
    layout.forEach(([g, x, y, z, s], i) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(s * 2.4, s * 2.4, s * 2.4),
        new THREE.MeshStandardMaterial({
          map: letterTexture(g, "#ffffff", HEX[g]),
          roughness: 0.35,
          metalness: 0.15,
        })
      );
      mesh.position.set(x, y, z);
      mesh.rotation.set(i, i * 0.7, 0);
      scene.add(mesh);
      floaters.push({ mesh, baseY: y, speed: 0.5 + (i % 3) * 0.18, phase: i * 1.3 });
    });

    /* ----- sizing ----- */
    const resize = () => {
      const w = Math.max(el.clientWidth, 1);
      const h = Math.max(el.clientHeight, 1);
      renderer.setSize(w, h, true);
      camera.aspect = w / h;
      const fitWidth = 5.6 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      const dist = Math.max(10, fitWidth);
      camera.position.set(0, 3.2 + (dist - 10) * 0.12, dist);
      camera.lookAt(lookAt);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* ----- pointer parallax ----- */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.tx = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.5, 1.5);
      pointer.ty = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.5, 1.5);
    };
    window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const list = targetsRef.current;
      const max = Math.max(...list, 1);

      bars.forEach((b, i) => {
        const c = list[i] ?? 0;
        const target = c === 0 ? 0.08 : 0.5 + (c / max) * 2.7;
        b.scale.y += (target - b.scale.y) * (reduce ? 1 : 0.055);
      });

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const m = reduce ? 0 : 1;
      chart.rotation.y = -0.42 + pointer.x * 0.4 + Math.sin(t * 0.45) * 0.14 * m;
      chart.rotation.x = 0.1 + pointer.y * 0.12;

      floaters.forEach((f) => {
        f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 0.28 * m;
        f.mesh.rotation.x += 0.004 * f.speed * m;
        f.mesh.rotation.y += 0.007 * f.speed * m;
      });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material as THREE.Material | THREE.Material[];
          (Array.isArray(mat) ? mat : [mat]).forEach((mm) => {
            const map = (mm as THREE.MeshStandardMaterial).map;
            if (map) map.dispose();
            mm.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
