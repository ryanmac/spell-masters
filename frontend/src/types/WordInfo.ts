// src/types/WordInfo.ts
export interface WordMeaning {
  partOfSpeech: string
  definition: string
  example: string
  synonyms: string[]
  antonyms: string[]
}

export interface WordInfo {
  word: string
  meanings: WordMeaning[]
}