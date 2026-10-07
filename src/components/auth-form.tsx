"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("error") === "google-not-configured" ? "Google sign-in needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env." : "");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(mode === "register" ? { name } : {}), email, password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? "That didn't work. Try again."); setPending(false); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setError("We couldn't connect. Check your internet and try again."); setPending(false); }
  };
  const isLogin = mode === "login";
  return <div className="auth-layout"><div className="auth-visual"><div className="auth-visual-top"><Link href="/" className="wordmark footer-wordmark"><span className="wordmark-stitch">T<span>F</span></span><span className="wordmark-name">THREADFORM</span><sup>®</sup></Link><span>GOOD IDEAS / GOOD PEOPLE</span></div><div className="auth-visual-art"><span>YOUR<br /><b>IDEAS</b><br />BELONG<br />HERE.</span><i>✳</i><span className="auth-visual-caption">OPEN CANVAS.<br />OPEN POSSIBILITIES.</span></div><div className="auth-visual-bottom"><span>NO STOCK. NO STRESS.</span><span>EST. GOOD IDEAS / 2025</span></div></div><section className="auth-card"><Link href="/" className="auth-back"><Icon name="arrow" size={16} /> Back to the shop</Link><span className="eyebrow">{isLogin ? "GOOD TO SEE YOU AGAIN" : "WELCOME TO THE GOOD SIDE"}</span><h1>{isLogin ? <>Pick up<br /><span>where you left off.</span></> : <>Let's make<br /><span>it official.</span></>}</h1><p>{isLogin ? "Sign in to see your orders, saved designs, and all the good things." : "Create an account to save your designs and keep every good idea close."}</p><form className="auth-form" onSubmit={submit}>{!isLogin && <label>YOUR NAME<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} autoComplete="name" placeholder="What should we call you?" /></label>}<label>EMAIL ADDRESS<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" /></label><label>PASSWORD<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} placeholder={isLogin ? "Your password" : "At least 8 characters"} /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-primary auth-submit" disabled={pending}>{pending ? "One sec…" : isLogin ? "Sign in" : "Create my account"}<Icon name="arrow" size={17} /></button></form><div className="auth-divider"><span>OR COME ON IN WITH</span></div><a className="google-button" href="/api/auth/google"><span className="google-g">G</span> Continue with Google <Icon name="arrowUp" size={15} /></a><p className="auth-switch">{isLogin ? "New around here?" : "Already have a THREADFORM account?"} <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Make one" : "Sign in"}</Link></p><div className="auth-privacy"><Icon name="lock" size={14} /> Your details stay private. Your ideas stay yours.</div></section></div>;
}
