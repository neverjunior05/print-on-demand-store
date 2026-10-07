import type { Metadata } from "next";
import { StudioLoader } from "@/components/studio-loader";

export const metadata: Metadata = {
  title: "Design Studio | THREADFORM",
  description: "Make your idea real in the THREADFORM browser design studio. Add type, art, or a little bit of you.",
};

export default function StudioPage() {
  return <div className="studio-page"><StudioLoader /></div>;
}
