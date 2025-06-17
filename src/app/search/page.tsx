import React, { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Loading search results...</p>}>
      <SearchPageClient />
    </Suspense>
  );
}
