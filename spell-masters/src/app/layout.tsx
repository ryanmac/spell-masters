// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import Layout from '@/components/Layout'
import { UserProvider } from '@/contexts/UserContext'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spell Masters',
  description: 'Master your spelling skills',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Layout>{children}</Layout>
        </UserProvider>
      </body>
    </html>
  )
}