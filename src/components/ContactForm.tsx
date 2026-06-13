"use client";

import { useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import type { Dictionary } from "@/i18n/dictionaries";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const t = dict.contact;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await sendContactMessage({
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      message: String(form.get("message") || ""),
      website: String(form.get("website") || ""),
    });
    if (res.ok) {
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/10 text-2xl">
          ✓
        </div>
        <p className="mt-4 font-serif text-xl text-ink">
          {dict.stay.confirmTitle.replace("séjour", "message")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-7">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div>
        <label className="label" htmlFor="name">
          {t.formName}
        </label>
        <input id="name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">
          {t.formEmail}
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="message">
          {t.formMessage}
        </label>
        <textarea id="message" name="message" required rows={5} className="input" />
      </div>
      {status === "error" && (
        <p className="text-sm text-terracotta">{dict.stay.errors.generic}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full"
      >
        {status === "sending" ? dict.stay.submitting : t.formSubmit}
      </button>
    </form>
  );
}
