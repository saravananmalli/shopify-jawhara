"use client";

import { useState, type FormEvent } from "react";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="border-t border-gold-100 bg-cream-100">
      <div className="mx-auto flex max-w-8xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-800">
            The Jawhara Circle &bull; UAE
          </p>
          <h2 className="mt-1 font-serif text-2xl text-gold-600">
            New Jewellery, Previews &amp; Private Offers
          </h2>
          <p className="mt-1 max-w-md text-sm text-brown-900/60">
            Be the first to see new gold, diamond and pearl collections, receive exclusive
            offers, and get gift ideas for every occasion.
          </p>
        </div>

        {submitted ? (
          <p className="text-sm font-medium text-gold-700">
            Thank you — you&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              className="w-full rounded-full border border-gold-200 bg-white px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-gold-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-gold-700"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
