import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in | THREADFORM", robots: { index: false, follow: false } };

export default function LoginPage() { return <Suspense fallback={<div className="auth-skeleton">Getting your good ideas…</div>}><AuthForm mode="login" /></Suspense>; }
