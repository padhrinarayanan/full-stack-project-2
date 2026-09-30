import type { CSSProperties } from "react";

/** Sets the --i custom property used for staggered entrance animations. */
export const stagger = (i: number): CSSProperties => ({ ["--i" as string]: i }) as CSSProperties;
