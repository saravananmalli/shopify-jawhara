import { Suspense } from "react";
import { ProductPageSkeleton } from "@/components/ui/Skeleton";

// Suspense in a persistent layout rather than loading.tsx — see
// app/collections/layout.tsx for why (no skeleton flash on client navigation).
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ProductPageSkeleton />}>{children}</Suspense>;
}
