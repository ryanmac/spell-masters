// src/components/PerformanceReview.tsx
'use client'

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { FaHome, FaRedo } from 'react-icons/fa';

interface IncorrectAnswer {
  word: string;
  userChoice: string;
  correctChoice: string;
}

interface AssessmentResults {
  score: number;
  totalQuestions: number;
  averageTimePerWord: number;
  incorrectAnswers: IncorrectAnswer[];
  correctWords: string[];
  starRating: number;
}

const PerformanceReview: React.FC = () => {
  const { user, updateUserProgress } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultsParam = searchParams.get('results')
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null)
  const [resultsProcessed, setResultsProcessed] = useState(false)

  useEffect(() => {
    if (resultsParam) {
      setAssessmentResults(JSON.parse(decodeURIComponent(resultsParam)))
    }
  }, [resultsParam])

  useEffect(() => {
    if (!assessmentResults || !user || resultsProcessed) {
      return;
    }

    const { score, totalQuestions, averageTimePerWord, incorrectAnswers, correctWords, starRating } = assessmentResults;
    const newWordsMastered = user.uniqueWordsMastered + correctWords.length;
    const newTotalStars = user.totalStars + starRating;
    const newAccuracyRate = ((user.accuracyRate * user.uniqueWordsMastered) + (score / totalQuestions * 100)) / newWordsMastered;
    const newAverageTimePerWord = ((user.averageTimePerWord * user.uniqueWordsMastered) + (averageTimePerWord * totalQuestions)) / newWordsMastered;
    
    // Update this line to remove correctly answered words from challengingWords
    const newChallengingWords = user.challengingWords.filter(word => !correctWords.includes(word));

    updateUserProgress({
      uniqueWordsMastered: newWordsMastered,
      totalStars: newTotalStars,
      accuracyRate: newAccuracyRate,
      averageTimePerWord: newAverageTimePerWord,
      challengingWords: newChallengingWords
    });

    setResultsProcessed(true);
  }, [assessmentResults, user, updateUserProgress, resultsProcessed]);

  if (!assessmentResults) {
    return <div>Loading...</div>
  }

  const { score, totalQuestions, averageTimePerWord, incorrectAnswers, correctWords, starRating } = assessmentResults

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Performance Review</h2>
        <div className="bg-blue-400 p-4 rounded mb-4">
          <h2 className='text-4xl'>{'⭐️'.repeat(starRating)}</h2>
          <p className='text-xl'><strong>{score}</strong> out of {totalQuestions} correct ({((score / totalQuestions) * 100).toFixed(0)}%)</p>
          <p>{averageTimePerWord.toFixed(2)} seconds per word</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Correct Words</h3>
          <ul className="list-disc pl-5">
            {correctWords.map((word, index) => (
              <li key={index} className="text-green-500">{word}</li>
            ))}
          </ul>
        </div>
        {incorrectAnswers.length > 0 ? (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Incorrect Words</h3>
            <ul className="list-disc pl-5">
              {incorrectAnswers.map((answer, index) => (
                <li key={index} className="text-red-500">
                  {answer.userChoice} → {answer.correctChoice}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
            <p>You got all the words correct!</p>
          </div>
        )}
        <div className="flex justify-between">
          <Link href={`/assessment/${user?.grade}?type=core`} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            <FaRedo size={24} />
          </Link>
          {(user?.challengingWords?.length ?? 0) > 0 && (
            <Link href="/targeted-reinforcement" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Practice Challenging Words
            </Link>
          )}
          <Link href="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            <FaHome size={24} />
          </Link>
        </div>
      </div>
    </Suspense>
  )
}

export default PerformanceReview