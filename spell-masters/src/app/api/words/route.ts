// src/app/api/words/route.ts
import { NextResponse } from 'next/server'
import wordLists from '@/data/word_lists.json'

const WORDS_PER_SUBLEVEL = 20
const COMPREHENSIVE_WORD_COUNT = 30

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level')
  const sublevel = parseInt(searchParams.get('sublevel') || '1', 10)
  const typeParam = searchParams.get('type') || 'core'
  const type = typeParam === 'core' ? 'words' : typeParam
  const count = parseInt(searchParams.get('count') || '20', 10)

  type LevelsType = {
    [key: string]: {
      words: string[];
      bonus: string[];
    };
  };

  const levels: LevelsType = wordLists.levels;

  if (!level || !levels[level]) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
  }

  let words: string[] = [];

  if (type === 'comprehensive') {
    const levelNum = parseInt(level);
    const startLevel = Math.max(1, levelNum - 9);
    for (let i = startLevel; i <= levelNum; i++) {
      words = words.concat(levels[i.toString()].words);
    }
    words = words.sort(() => 0.5 - Math.random()).slice(0, COMPREHENSIVE_WORD_COUNT);
  } else {
    const allWords = levels[level][type as 'words' | 'bonus'];
    const startIndex = (sublevel - 1) * WORDS_PER_SUBLEVEL;
    const endIndex = startIndex + WORDS_PER_SUBLEVEL;
    words = allWords.slice(startIndex, endIndex);
    
    if (words.length < WORDS_PER_SUBLEVEL) {
      return NextResponse.json({ error: 'Invalid sublevel' }, { status: 400 })
    }
  }

  if (!words || words.length === 0) {
    return NextResponse.json({ error: 'No words found for the specified level, type, and sublevel' }, { status: 404 })
  }

  return NextResponse.json({ words })
}