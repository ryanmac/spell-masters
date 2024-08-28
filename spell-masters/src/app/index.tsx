// src/app/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import ProfileSelection from '../components/ProfileSelection'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Spell Masters</title>
        <meta name="description" content="Master your spelling skills" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center my-8">Spell Masters</h1>
        <ProfileSelection />
      </main>
    </div>
  )
}

export default Home