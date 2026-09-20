import {
  DELIVERY_LABELS,
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

const CUTOFF_TEXT = `${SAME_DAY_CUTOFF_HOUR - 12} PM`;

/**
 * Null when the item can't ship now (out of stock) — never promise a date for
 * it. With no emirate chosen yet, quote the conservative range so a visitor
 * outside Dubai isn't promised same-day.
 */
export function getDeliveryEstimate({
  emirate,
  available,
  pastCutoff,
}: {
  emirate: string | null;
  available: boolean;
  pastCutoff: boolean;
}): DeliveryEstimate | null {
  if (!available) return null;

  if (emirate === null) {
    return {
      label: DELIVERY_LABELS.standard,
      detail: `Same day in Dubai for orders before ${CUTOFF_TEXT}`,
    };
  }
  if (SAME_DAY_EMIRATES.includes(emirate)) {
    return pastCutoff
      ? {
          label: DELIVERY_LABELS.nextDay,
          detail: `Order before ${CUTOFF_TEXT} for same-day delivery`,
        }
      : {
          label: DELIVERY_LABELS.sameDay,
          detail: `Order before ${CUTOFF_TEXT}`,
        };
  }
  return { label: DELIVERY_LABELS.standard, detail: null };
}
