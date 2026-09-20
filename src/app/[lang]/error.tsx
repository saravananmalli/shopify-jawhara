"use client";

import { useEffect } from "react";
import Link from "@/components/ui/Link";
import { useDictionary } from "@/store/locale";
import { formatMessage } from "@/utils/i18n";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { errors: t } = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="mx-auto max-w-8xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">{t.somethingWrong}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-brown-900/60">
        {t.loadFailed}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-gold-600 px-6 py-3 text-sm font-medium text-white transition-colors duration-(--motion-fast) hover:bg-gold-700"
        >
          {t.tryAgain}
        </button>
        <Link
          href="/"
          className="rounded-full border border-gold-600 px-6 py-3 text-sm font-medium text-gold-700 transition-colors duration-(--motion-fast) hover:bg-gold-50"
        >
          {t.backHome}
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-brown-900/40">
          {formatMessage(t.reference, { digest: error.digest })}
        </p>
      )}
    </section>
  );
}
