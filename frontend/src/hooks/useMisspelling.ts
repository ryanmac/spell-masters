// src/hooks/useMisspelling.ts
import { useState, useEffect, useCallback } from 'react'
import { MisspellingGenerator } from '@/utils/MisspellingGenerator'

export function useMisspelling() {
  const [generator, setGenerator] = useState<MisspellingGenerator | null>(null)

  useEffect(() => {
    const initGenerator = async () => {
      const newGenerator = new MisspellingGenerator()
      setGenerator(newGenerator)
    }
    initGenerator()
  }, [])

  const generateMisspellings = useCallback((word: string, count: number = 3) => {
    if (!generator) return []
    const misspellings = generator.generateMisspellings(word, count)
    return misspellings.filter(m => m !== word) // Ensure the correct word is not included
  }, [generator])

  return { generateMisspellings }
}