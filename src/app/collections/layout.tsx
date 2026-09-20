import { Suspense } from "react";
import { CollectionPageSkeleton } from "@/components/ui/Skeleton";

// A Suspense here instead of a loading.tsx on purpose: loading.tsx is
// prefetched and swapped in the moment a category tile is clicked, blanking
// the page (strip included) for a beat. This boundary lives in a layout that
// persists across collections, so a client navigation keeps the current page
// on screen until the next one is ready, while a hard load still streams the
// skeleton first.
export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<CollectionPageSkeleton />}>{children}</Suspense>;
}
