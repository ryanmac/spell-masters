// src/app/performance-review/page.tsx
'use client'

import { Suspense } from 'react'
import PerformanceReview from '@/components/PerformanceReview'

export default function PerformanceReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PerformanceReview />
    </Suspense>
  )
}