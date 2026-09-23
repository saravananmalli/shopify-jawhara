"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
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
    <section role="alert" className="page-container py-24 text-center">
      <h1 className="font-serif text-3xl">{t.somethingWrong}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-brown-900/60">
        {t.loadFailed}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" onClick={() => retry()} className="px-6 py-3 text-sm font-medium">
          {t.tryAgain}
        </Button>
        <Button href="/" variant="secondary" className="px-6 py-3 text-sm font-medium">
          {t.backHome}
        </Button>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-brown-900/40">
          {formatMessage(t.reference, { digest: error.digest })}
        </p>
      )}
    </section>
  );
}
