import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Connexion — Administration",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1C1612] px-5">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-zellige opacity-10" />
      {/* Gradient glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta/10 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo block */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/20 ring-1 ring-terracotta/30">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon
                points="14,2 16.4,10.2 24.5,7.6 19.2,14 24.5,20.4 16.4,17.8 14,26 11.6,17.8 3.5,20.4 8.8,14 3.5,7.6 11.6,10.2"
                fill="#B8943F"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-white">Mbn Demo Riad</h1>
          <p className="mt-1 text-sm text-white/50">Espace propriétaire</p>
        </div>

        {/* Form card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-md shadow-2xl">
          <LoginForm dark />
        </div>

        <p className="mt-5 text-center text-xs text-white/30">
          Accès réservé au propriétaire du riad.
        </p>
      </div>
    </div>
  );
}
