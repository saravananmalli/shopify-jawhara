import { formatMessage } from "@/utils/i18n";
import type { Dictionary } from "@/dictionaries";
import {
  DELIVERY_TIME_ZONE,
  SAME_DAY_CUTOFF_HOUR,
  SAME_DAY_EMIRATES,
} from "@/config/delivery";

export type DeliveryEstimate = {
  label: string;
  /** Secondary line for the product page; null when there's nothing to add. */
  detail: string | null;
};

const dubaiHour = new Intl.DateTimeFormat("en-GB", {
  timeZone: DELIVERY_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

export function isPastSameDayCutoff(now: Date = new Date()): boolean {
  return Number(dubaiHour.format(now)) >= SAME_DAY_CUTOFF_HOUR;
}

/**
 * Null when the item can't ship now (out of stock) — never promise a date for
 * it. With no emirate chosen yet, quote the conservative range so a visitor
 * outside Dubai isn't promised same-day.
 */
export function getDeliveryEstimate({
  emirate,
  available,
  pastCutoff,
  t,
}: {
  emirate: string | null;
  available: boolean;
  pastCutoff: boolean;
  t: Dictionary["delivery"];
}): DeliveryEstimate | null {
  if (!available) return null;

  const time = formatMessage(t.cutoffTime, { hour: SAME_DAY_CUTOFF_HOUR - 12 });

  if (emirate === null) {
    return {
      label: t.standard,
      detail: formatMessage(t.sameDayInDubai, { time }),
    };
  }
  if (SAME_DAY_EMIRATES.includes(emirate)) {
    return pastCutoff
      ? {
          label: t.nextDay,
          detail: formatMessage(t.orderBeforeSameDay, { time }),
        }
      : {
          label: t.sameDay,
          detail: formatMessage(t.orderBefore, { time }),
        };
  }
  return { label: t.standard, detail: null };
}
