// src/app/page.tsx
'use client'

import ProfileSelection from '@/components/ProfileSelection'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <h1 className="text-4xl font-bold text-center my-8">Spell Masters</h1>
      <ProfileSelection />
    </main>
  )
}