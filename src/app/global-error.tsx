"use client";

import "./globals.css";
import Button from "@/components/ui/Button";

// Replaces the root layout, which itself fetches Shopify data (nav, brand) —
// so a Shopify outage lands here rather than on error.tsx.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-cream-50 px-4 text-brown-900">
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-3xl">Jawhara is briefly unavailable</h1>
          <p className="mt-3 text-sm text-brown-900/60">
            We&rsquo;re having trouble reaching our catalogue. Please try again shortly.
          </p>
          {/* This page replaces the root layout, so it cannot know the shopper's
              language — it says both. */}
          <div dir="rtl" lang="ar" className="mt-6">
            <h2 className="text-2xl">جوهرة غير متاحة مؤقتًا</h2>
            <p className="mt-2 text-sm text-brown-900/60">
              نواجه صعوبة في الوصول إلى الكتالوج. يُرجى المحاولة مرة أخرى بعد قليل.
            </p>
          </div>
          <Button
            onClick={() => retry()}
            className="mt-8 rounded-full! px-6 py-3 text-sm font-medium"
          >
            Try again · حاول مرة أخرى
          </Button>
        </div>
      </body>
    </html>
  );
}
