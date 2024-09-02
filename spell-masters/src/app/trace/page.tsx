// src/app/trace/page.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Trace component with client-side rendering only
const Trace = dynamic(() => import('@/components/Trace'), { ssr: false });

export default function TracePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Trace />
    </Suspense>
  );
}