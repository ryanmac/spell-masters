// src/app/api/words/route.ts
import { NextResponse } from 'next/server'
import wordLists from '@/data/word_lists.json'

const WORDS_PER_SUBLEVEL = 20
const COMPREHENSIVE_WORD_COUNT = 30

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level')
  const sublevel = parseInt(searchParams.get('sublevel') || '1', 10)
  const typeParam = searchParams.get('type') || 'core'
  const count = parseInt(searchParams.get('count') || '20', 10)
  const challengingWordsParam = searchParams.get('challengingWords') || '[]'
  const challengingWords = JSON.parse(decodeURIComponent(challengingWordsParam))


  type LevelsType = {
    [key: string]: {
      words: string[];
      bonus: string[];
    };
  };

  const levels: LevelsType = wordLists.levels;

  if (!level || (level !== 'targeted' && !levels[level])) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
  }

  let words: string[] = [];

  if (level === 'targeted') {
    // For targeted reinforcement, use the challenging words directly
    words = challengingWords;
  } else if (typeParam === 'comprehensive') {
    const coreWords = levels[level].words;
    const bonusWords = levels[level].bonus;
    const allWords = [...coreWords, ...bonusWords];
    const availableWords = allWords.filter(word => !challengingWords.includes(word));
    const randomWords = availableWords.sort(() => 0.5 - Math.random()).slice(0, COMPREHENSIVE_WORD_COUNT - challengingWords.length);
    words = [...challengingWords, ...randomWords];
  } else {
    const type = typeParam === 'core' ? 'words' : 'bonus';
    const allWords = levels[level][type];
    const startIndex = (sublevel - 1) * WORDS_PER_SUBLEVEL;
    const endIndex = startIndex + WORDS_PER_SUBLEVEL;
    words = allWords.slice(startIndex, endIndex);

    if (words.length < WORDS_PER_SUBLEVEL) {
      return NextResponse.json({ error: 'Invalid sublevel' }, { status: 400 })
    }
  }

  words = shuffleArray(words).slice(0, count);

  if (!words || words.length === 0) {
    return NextResponse.json({ error: 'No words found for the specified level, type, and sublevel' }, { status: 404 })
  }

  return NextResponse.json({ words })
}