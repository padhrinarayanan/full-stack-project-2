import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "../utils/cn";

/** Card that tilts in 3D toward the pointer and shows a moving glare. */
export default function TiltCard({
  children,
  className,
  style,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max * 2).toFixed(2)}deg) rotateY(${(
      (px - 0.5) *
      max *
      2
    ).toFixed(2)}deg) scale3d(1.02,1.02,1.02)`;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={style}
      className={cn("tilt relative transition-transform duration-200 ease-out", className)}
    >
      {children}
      <span aria-hidden="true" className="tilt-glare pointer-events-none absolute inset-0 rounded-[inherit]" />
    </div>
  );
}
