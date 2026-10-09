"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS } from "@/lib/accounts";
import { frontierLogoSrc } from "@/lib/frontier-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error || "Those credentials are not recognised.");
        setPending(false);
        return;
      }
      router.refresh();
      router.push("/showcase");
    } catch {
      setError("We could not reach sign-in. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#13294B] text-[#F3F5F8]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(200,16,46,.38), transparent 36%), radial-gradient(circle at 88% 0%, rgba(14,118,114,.32), transparent 32%)",
        }}
      />
      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-10 px-4 py-10 lg:flex-row lg:items-center lg:px-8">
        <section className="max-w-xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frontierLogoSrc} alt="Frontier Healthcare" className="h-14 w-auto rounded-xl bg-white px-4 py-2" />
          <p className="mt-8 font-mono text-[11px] tracking-[0.16em] text-[#B9C6DA] uppercase">
            DTR v1 · Client edition · October 2026
          </p>
          <h1 className="mt-3 font-heading text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
            Frontier Healthcare Digital Transformation 2026–27
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#C5D0E2]">
            One plan for the Frontier website and local search, the Qualitas Health SG group site, IMC, a corporate
            programme, and AI video for patient education. Prepared by Caspian Digital Solutions.
          </p>
        </section>

        <Card className="w-full max-w-md border-0 bg-white text-[#13294B] shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-[#13294B]">Open the roadmap</CardTitle>
            <CardDescription className="text-[#5B6880]">
              Two demo roles. Editors can change the wording in place. Viewers cannot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={onSubmit} aria-busy={pending}>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Sign-in failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={pending}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={pending}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="h-11 bg-[#C8102E] text-white hover:bg-[#a30d26]"
              >
                {pending ? "Signing in…" : "Enter the roadmap"}
              </Button>
            </form>

            <div className="mt-6 grid gap-2">
              <p className="font-mono text-[11px] tracking-[0.12em] text-[#5B6880] uppercase">Demo credentials</p>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError(null);
                  }}
                  className="rounded-xl border border-[#D3DAE4] bg-[#F3F5F8] px-3 py-3 text-left transition hover:border-[#13294B] disabled:opacity-60 motion-safe:hover:-translate-y-0.5"
                >
                  <span className="block text-sm font-semibold text-[#13294B]">{account.title}</span>
                  <span className="mt-1 block font-mono text-xs text-[#2C3A52]">
                    {account.email}
                    <span className="text-[#5B6880]"> · </span>
                    {account.password}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#5B6880]">{account.detail}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
