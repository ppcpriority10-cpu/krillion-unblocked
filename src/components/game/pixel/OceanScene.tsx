"use client";

import { CSSProperties } from "react";
import { LiveOceanCanvas, type OceanCameraState } from "./LiveOceanCanvas";

/* ============================================================
   Krillion ocean world — a FULLY LIVE, ANIMATED, SCROLLING
   canyon drawn on canvas (LiveOceanCanvas). No static
   background images: the v4 pixel-art scenes and v5 3D-render
   scenes were both rejected by the user ("you're using images —
   everything should be LIVE, like a real ocean"). v23: every
   creature is drawn + animated in code — smooth and alive,
   not pixel art and not pictures. Fish swim, bubbles rise,
   seaweed sways, jellyfish pulse, and the camera descends
   through the canyon as the depth counter runs.

   This component keeps the same props as before, so
   KrillionGame.tsx is untouched — `depth` drives the camera,
   `playing` picks the surface view vs the underwater view,
   `viewTint` darkens the finished screen. All game UI (HUD,
   prompt bar, krill, dock, ruler) lives in the content layer
   above this scene.
   ============================================================ */

export function OceanScene({
  depth = 0,
  viewTint,
  playing = false,
  className,
  style,
  cameraRef,
}: {
  /** current depth in metres — drives the camera descent */
  depth?: number;
  /** optional 0..1 extra darkening (finished screen etc) */
  viewTint?: number;
  /** in-play: camera is underwater at the current depth */
  playing?: boolean;
  className?: string;
  style?: CSSProperties;
  /** optional shared ref the canvas publishes its camera into (v20: drives the DOM ruler) */
  cameraRef?: { current: OceanCameraState };
}) {
  const tint = viewTint != null ? Math.min(0.85, Math.max(0, viewTint) * 1.2) : 0;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#04101F] ${className ?? ""}`}
      style={style}
    >
      {/* the living ocean — canvas, fully animated */}
      <LiveOceanCanvas depth={depth} playing={playing} cameraRef={cameraRef} />

      {/* soft vignette: pulls the eye to the centre, deepens the scene */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(1,10,20,0.26) 100%)",
        }}
      />

      {/* finished-screen darkening (results legibility) */}
      {tint > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-linear"
          style={{ background: "#03121F", opacity: tint }}
        />
      )}
    </div>
  );
}
