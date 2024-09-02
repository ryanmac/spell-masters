// src/components/TargetedReinforcement.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import AssessmentMode from './AssessmentMode'

interface AssessmentResults {
  score: number;
  totalQuestions: number;
  incorrectAnswers: { word: string; userChoice: string; correctChoice: string }[];
  correctWords: string[];
  averageTimePerWord: number;
}

const TargetedReinforcement: React.FC = () => {
  const { user, updateUserProgress } = useUser()
  const router = useRouter()
  const [challengingWords, setChallengingWords] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      setChallengingWords(user.challengingWords)
    }
  }, [user])

  const handleAssessmentComplete = useCallback((results: AssessmentResults) => {
    if (user) {
      const newChallengingWords = challengingWords.filter(word => !results.correctWords.includes(word))
      
      updateUserProgress({
        challengingWords: newChallengingWords,
        totalWordsAttempted: user.totalWordsAttempted + results.totalQuestions,
        totalCorrectAttempts: user.totalCorrectAttempts + results.score,
        averageTimePerWord: (
          (user.averageTimePerWord * user.totalWordsAttempted + results.averageTimePerWord * results.totalQuestions) /
          (user.totalWordsAttempted + results.totalQuestions)
        ),
      })

      if (newChallengingWords.length > 0) {
        router.push(`/kinesthetic-practice?words=${encodeURIComponent(JSON.stringify(newChallengingWords))}`)
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, challengingWords, updateUserProgress, router])

  if (!user || challengingWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Practice</h2>
        <p className="mb-4">Congratulations! You have no challenging words to practice.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  console.log('Challenging words:', challengingWords)
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Practice</h2>
      <AssessmentMode 
        levelId="targeted"
        assessmentType="core"
        onComplete={handleAssessmentComplete}
        predefinedWords={challengingWords}
      />
    </div>
  )
}

export default TargetedReinforcement