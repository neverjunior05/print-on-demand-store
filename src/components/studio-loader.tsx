"use client";

import dynamic from "next/dynamic";

const StudioEditor = dynamic(() => import("@/components/studio-editor").then((module) => module.StudioEditor), {
  ssr: false,
  loading: () => <div className="studio-loading-page"><span className="loading-spinner" /><p>Warming up the press…</p><span>YOUR CANVAS IS ON ITS WAY</span></div>,
});

export function StudioLoader() {
  return <StudioEditor />;
}
