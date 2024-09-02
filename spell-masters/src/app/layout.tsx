// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Figtree, Monda, Kablammo, Playpen_Sans, Noto_Sans, Quicksand, Shantell_Sans, Edu_TAS_Beginner } from 'next/font/google'
import Layout from '@/components/Layout'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '700'],
  display: 'swap',
})

const figtree = Figtree({ 
  subsets: ['latin'],
  variable: '--font-figtree',
  weight: ['400', '700'],
  display: 'swap',
})

const monda = Monda({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-monda',
  display: 'swap',
})

const kablammo = Kablammo({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-kablammo',
  display: 'swap',
})

const playpenSans = Playpen_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playpen-sans',
  display: 'swap',
})

const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const quicksand = Quicksand({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-quicksand',
  display: 'swap',
})

const shantellSans = Shantell_Sans({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-shantell-sans',
  display: 'swap',
})

const eduTASBeginner = Edu_TAS_Beginner({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-edu-tas-beginner',
  display: 'swap',
})

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
      <body className={`${inter.variable} ${figtree.variable} ${monda.variable} ${kablammo.variable} ${playpenSans.variable} ${notoSans.variable} ${quicksand.variable} ${shantellSans.variable} ${eduTASBeginner.variable}`}>
        {/* <h1 className="text-2xl font-inter">Whereas disregard and contempt for human rights have resulted - Inter</h1>
        <h1 className="text-2xl font-figtree">Whereas disregard and contempt for human rights have resulted - Figtree font.</h1>
        <h1 className="text-2xl font-monda">Whereas disregard and contempt for human rights have resulted - Monda font.</h1>
        <h1 className="text-2xl font-kablammo">Whereas disregard and contempt for human rights have resulted - Kablamo font.</h1>
        <h1 className="text-2xl font-playpen-sans">Whereas disregard and contempt for human rights have resulted - Playpen Sans font.</h1>
        <h1 className="text-2xl font-noto-sans">Whereas disregard and contempt for human rights have resulted - Noto Sans font.</h1>
        <h1 className="text-2xl font-quicksand">Whereas disregard and contempt for human rights have resulted - Quicksand font.</h1>
        <h1 className="text-2xl font-shantell-sans">Whereas disregard and contempt for human rights have resulted - Shantell Sans font.</h1>
        <h1 className="text-2xl font-edu-tas-beginner">Whereas disregard and contempt for human rights have resulted - Edu TAS Beginner font.</h1> */}
        <UserProvider>
          <div className="font-inter">
            <Layout>{children}</Layout>
          </div>
        </UserProvider>
      </body>
    </html>
  )
}