// src/app/comprehensive-evaluation/[levelId]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useUser, Evaluation } from '@/contexts/UserContext'
import AssessmentMode from '@/components/AssessmentMode'
import { useParams, useSearchParams } from 'next/navigation'

const ComprehensiveEvaluation: React.FC = () => {
  const { user, updateUserProgress } = useUser()
  const params = useParams()
  const searchParams = useSearchParams()
  const [evaluationLevel, setEvaluationLevel] = useState<string>('1')
  const [type, setType] = useState<'core' | 'bonus'>('core')
  const [evaluationComplete, setEvaluationComplete] = useState(false)

  useEffect(() => {
    const levelId = params.levelId as string
    const typeParam = searchParams.get('type')
    if (levelId) {
      setEvaluationLevel(levelId)
    }
    if (typeParam === 'core' || typeParam === 'bonus') {
      setType(typeParam)
    }
  }, [params, searchParams])

  const handleEvaluationComplete = (results: any) => {
    console.log('Evaluation complete, results:', results);
    if (user) {
      const newEvaluation: Evaluation = {
        date: new Date().toISOString(),
        level: evaluationLevel,
        type: type,
        score: results.score,
        totalQuestions: results.totalQuestions,
        wordsTested: [...results.correctWords, ...results.incorrectAnswers.map((a: any) => a.word)],
        incorrect: results.incorrectAnswers.map((a: any) => a.word),
      };

      const updatedEvaluations = [...(user.comprehensiveEvaluations || []), newEvaluation];

      updateUserProgress({
        comprehensiveEvaluations: updatedEvaluations,
        totalWordsAttempted: user.totalWordsAttempted + results.totalQuestions,
        totalCorrectAttempts: user.totalCorrectAttempts + results.score,
        averageTimePerWord: (
          (user.averageTimePerWord * user.totalWordsAttempted + results.averageTimePerWord * results.totalQuestions) /
          (user.totalWordsAttempted + results.totalQuestions)
        ),
        challengingWords: [
          ...new Set([...user.challengingWords, ...results.incorrectAnswers.map((a: any) => a.word)])
        ],
      });

      console.log('Updated comprehensive evaluations:', updatedEvaluations);
      setEvaluationComplete(true);
    }
  }

  if (evaluationComplete) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Comprehensive Evaluation Complete</h2>
        {/* Display evaluation results */}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comprehensive Evaluation</h2>
      <p className="mb-4">This evaluation will test your knowledge of words from Level {evaluationLevel} {type}.</p>
      <AssessmentMode 
        levelId={evaluationLevel} 
        assessmentType="comprehensive" 
        onComplete={handleEvaluationComplete}
        comprehensiveType={type}
      />
    </div>
  )
}

export default ComprehensiveEvaluation