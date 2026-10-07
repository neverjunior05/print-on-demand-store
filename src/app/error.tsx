"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("THREADFORM route error", error); }, [error]);
  return <div className="not-found-page error-page"><span className="not-found-stamp">OH<br />NO ✳</span><span className="eyebrow">A LITTLE PRINT-SHOP HICCUP</span><h1>That didn't<br /><span>go to plan.</span></h1><p>Nothing's lost. Let's give this page another go.</p><div><button className="button button-primary" onClick={() => reset()}>Try again <Icon name="undo" size={16} /></button><Link href="/" className="text-link">Back to the shop</Link></div></div>;
}
