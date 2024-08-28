// src/app/api/sentences/route.ts
import { NextResponse } from 'next/server'
import wordSentences from '@/data/word_sentences.json'

// Define the type of wordSentences to handle arbitrary string keys
type WordSentencesType = {
  [key: string]: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const word = searchParams.get('word')

  // Type the wordSentences object
  const sentences = (wordSentences as WordSentencesType)[word || ''];

  // Default placeholder sentence
  const defaultSentence = "Which of these words is spelled correctly?"

  if (!sentences || sentences.length === 0) {
    // If word does not exist in the dataset, return default sentence
    return NextResponse.json({ sentence: defaultSentence })
  }

  // Select a random sentence
  const randomSentence = sentences[Math.floor(Math.random() * sentences.length)]

  // Replace the word with an empty space
  const formattedSentence = randomSentence.replace(new RegExp(`\\b${word}\\b`, 'gi'), '_______')

  return NextResponse.json({ sentence: formattedSentence })
}