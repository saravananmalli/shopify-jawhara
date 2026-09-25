/**
 * Today's gold price for Layla. Shopify has no notion of a metal rate, so this
 * reads the international spot price from a keyless public feed and converts it
 * to AED per gram by karat. It is a reference rate — never Jawhara's selling
 * price, which also carries making charges, stones and VAT.
 */
export type GoldPrices = {
  currency: "AED";
  /** AED per gram, by karat. */
  prices: { karat: string; perGram: number }[];
  /** ISO timestamp of the spot quote. */
  updatedAt: string;
};

const TROY_OUNCE_GRAMS = 31.1035;
/** The dirham is officially pegged to the US dollar at this fixed rate. */
const AED_PER_USD = 3.6725;
const KARATS = [24, 22, 21, 18, 14] as const;
const REVALIDATE_SECONDS = 600;

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`gold feed responded ${res.status}`);
  return res.json();
}

type Quote = { usdPerOunce: number; updatedAt: string };

const SOURCES: (() => Promise<Quote>)[] = [
  async () => {
    const json = (await getJson("https://api.gold-api.com/price/XAU")) as { price?: number; updatedAt?: string };
    return { usdPerOunce: Number(json.price), updatedAt: json.updatedAt ?? new Date().toISOString() };
  },
  async () => {
    const json = (await getJson("https://api.coinbase.com/v2/prices/XAU-USD/spot")) as { data?: { amount?: string } };
    return { usdPerOunce: Number(json.data?.amount), updatedAt: new Date().toISOString() };
  },
];

export async function getGoldPrices(): Promise<GoldPrices> {
  for (const source of SOURCES) {
    try {
      const { usdPerOunce, updatedAt } = await source();
      // Reject nonsense (a failed parse, a wrong unit) rather than quote it to a shopper.
      if (!Number.isFinite(usdPerOunce) || usdPerOunce < 500 || usdPerOunce > 20000) continue;
      const aedPerGram24 = (usdPerOunce * AED_PER_USD) / TROY_OUNCE_GRAMS;
      return {
        currency: "AED",
        prices: KARATS.map((karat) => ({
          karat: `${karat}K`,
          perGram: Math.round(((aedPerGram24 * karat) / 24) * 4) / 4,
        })),
        updatedAt,
      };
    } catch (error) {
      console.warn("[gold] source failed", error instanceof Error ? error.message : error);
    }
  }
  throw new Error("All gold price sources failed");
}
