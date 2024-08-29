// src/app/api/definitions/route.ts
import { NextResponse } from 'next/server'
import wordDefinitions from '@/data/word_definitions.json'

// Define the type of wordDefinitions to handle arbitrary string keys
type WordDefinitionsType = {
  [key: string]: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const word = searchParams.get('word')

  // Type the wordDefinitions object
  const definitions = (wordDefinitions as WordDefinitionsType)[word || ''];

  // Default placeholder definition
  const defaultDefinition = "Undefined"

  if (!definitions || definitions.length === 0) {
    // If word does not exist in the dataset, return default definition
    return NextResponse.json({ definitions: defaultDefinition })
  }

  // Replace the word with an empty space for all definitions
  const formattedDefinitions = definitions.map((definition) => {
    return definition.replace(new RegExp(`\\b${word}\\b`, 'gi'), '_______')
  })

  return NextResponse.json({ definition: formattedDefinitions })
}