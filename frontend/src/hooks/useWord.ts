// src/hooks/useWord.ts
import { useState, useEffect } from 'react'
import { WordInfo } from '@/types/WordInfo'
import { logError, getErrorMessage } from '@/utils/errorHandling'

export function useWord(word: string) {
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWordInfo = async () => {
      try {
        setError(null)
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          const meanings = entry.meanings.map((meaning: any) => ({
            partOfSpeech: meaning.partOfSpeech,
            definition: meaning.definitions[0]?.definition || '',
            example: meaning.definitions[0]?.example || `Which of these are spelled correctly?`,
            synonyms: meaning.synonyms.slice(0, 5),
            antonyms: meaning.antonyms.slice(0, 5),
          }));
          setWordInfo({ word: entry.word, meanings });
        } else {
          throw new Error('No word information found');
        }
      } catch (error) {
        logError(error, 'useWord hook');
        setError(getErrorMessage(error));
        const meanings = [{
          partOfSpeech: 'Unknown',
          definition: 'Unknown',
          example: 'Which of these are spelled correctly?',
          synonyms: [],
          antonyms: [],
        }];
        setWordInfo({ word, meanings });
      }
    }
    if (word) {
      fetchWordInfo();
    }
  }, [word])

  return { wordInfo, error }
}