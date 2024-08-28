// src/app/comprehensive-evaluation/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import AssessmentMode from '@/components/AssessmentMode'

const ComprehensiveEvaluation: React.FC = () => {
  const { user, updateUserProgress } = useUser()
  const [evaluationLevel, setEvaluationLevel] = useState(1)
  const [evaluationComplete, setEvaluationComplete] = useState(false)

  useEffect(() => {
    if (user) {
      setEvaluationLevel(Math.max(1, user.grade - 2))
    }
  }, [user])

  const handleEvaluationComplete = (results: any) => {
    console.log('Evaluation complete, results:', results);
    if (user) {
      const newEvaluation = {
        date: new Date().toISOString(),
        levelTested: evaluationLevel,
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
      <p className="mb-4">This evaluation will test your knowledge of words from the previous three levels.</p>
      <AssessmentMode levelId={evaluationLevel.toString()} assessmentType="comprehensive" onComplete={handleEvaluationComplete} />
    </div>
  )
}

export default ComprehensiveEvaluation