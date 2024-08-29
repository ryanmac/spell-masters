// src/app/api/word-data/route.ts
import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// Define the types for wordDefinitions and wordSentences to handle arbitrary string keys
type WordDataType = {
  [key: string]: string[];
}

async function loadJSON(filePath: string): Promise<WordDataType> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load file: ${filePath}`, error);
    return {};
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const word = searchParams.get('word')?.toLowerCase() || '';

  // Validate the word input
  if (!word || word.length === 0) {
    return NextResponse.json({
      definitions: ["Undefined"],
      sentence: "Which of these words is spelled correctly?"
    });
  }

  const firstLetter = word[0];
  
  // Construct file paths
  const definitionsFilePath = path.join(process.cwd(), `src/data/definitions/${firstLetter}.json`);
  const sentencesFilePath = path.join(process.cwd(), `src/data/sentences/${firstLetter}.json`);

  // Load the relevant JSON files
  const wordDefinitions = await loadJSON(definitionsFilePath);
  const wordSentences = await loadJSON(sentencesFilePath);

  // Retrieve the relevant data
  const definitions = wordDefinitions[word] || ["Undefined"];
  const sentences = wordSentences[word] || ["Which of these words is spelled correctly?"];

  // Handle definitions
  const formattedDefinitions = definitions.map((definition) => {
    return definition.replace(new RegExp(`\\b${word}\\b`, 'gi'), '_______');
  });

  // Handle sentences
  const formattedSentence = sentences.length > 0
    ? sentences[Math.floor(Math.random() * sentences.length)].replace(new RegExp(`\\b${word}\\b`, 'gi'), '_______')
    : "Which of these words is spelled correctly?";

  // Return combined response
  return NextResponse.json({
    definitions: formattedDefinitions,
    sentence: formattedSentence
  });
}