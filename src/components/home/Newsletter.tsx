"use client";

import { useId, useState, type FormEvent } from "react";
import { useDictionary } from "@/store/locale";

export default function Newsletter() {
  const t = useDictionary().home.newsletter;
  const emailId = useId();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="border-t border-gold-100 bg-cream-100">
      <div className="flex page-container flex-col items-start justify-between gap-4 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-800">
            {t.eyebrow}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-gold-600">
            {t.title}
          </h2>
          <p className="mt-1 max-w-md text-sm text-brown-900/60">
            {t.body}
          </p>
        </div>

        {submitted ? (
          <p className="text-sm font-medium text-gold-700">
            {t.thanks}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <label htmlFor={emailId} className="sr-only">
              {t.emailLabel}
            </label>
            <input
              id={emailId}
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder={t.placeholder}
              className="w-full rounded-full border border-gold-200 bg-white px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-gold-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-gold-700"
            >
              {t.subscribe}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
