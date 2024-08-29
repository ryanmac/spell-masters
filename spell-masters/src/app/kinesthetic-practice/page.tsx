// src/app/kinesthetic-practice/page.tsx
'use client'

import { Suspense } from 'react'
import KinestheticPractice from '@/components/KinestheticPractice'

export default function KinestheticPracticePage() {
  <Suspense fallback={<div>Loading...</div>}>
    return <KinestheticPractice />
  </Suspense>
}