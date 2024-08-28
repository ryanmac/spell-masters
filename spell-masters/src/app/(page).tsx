// src/app/(page).tsx
import ProfileSelection from '@/components/ProfileSelection'

export default function Home() {
  return (
    <main>
      <h1 className="text-4xl font-bold text-center my-8">Spell Masters</h1>
      <ProfileSelection />
    </main>
  )
}