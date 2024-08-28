// src/components/ComprehensiveEvaluation.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import AssessmentMode from './AssessmentMode'
import { useRouter } from 'next/navigation'

interface AssessmentResults {
  score: number;
  totalQuestions: number;
  incorrectAnswers: { word: string; userChoice: string; correctChoice: string }[];
  correctWords: string[];
  averageTimePerWord: number;
}

const ComprehensiveEvaluation: React.FC = () => {
  const { user, updateUserProgress } = useUser()
  const [evaluationLevel, setEvaluationLevel] = useState(1)
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<AssessmentResults | null>(null)

  useEffect(() => {
    if (user) {
      setEvaluationLevel(Math.max(1, user.grade - 2))
    }
  }, [user])

  const handleAssessmentComplete = useCallback((results: AssessmentResults) => {
    console.log('handleAssessmentComplete called in ComprehensiveEvaluation', results);
    if (user) {
      const newEvaluation = {
        date: new Date().toISOString(),
        levelTested: evaluationLevel,
        score: results.score,
        totalQuestions: results.totalQuestions,
        wordsTested: [...results.correctWords, ...results.incorrectAnswers.map(a => a.word)],
        incorrect: results.incorrectAnswers.map(a => a.word),
      };

      console.log('New evaluation:', newEvaluation);
      console.log('Current user evaluations:', user.comprehensiveEvaluations);

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
          ...new Set([...user.challengingWords, ...results.incorrectAnswers.map(a => a.word)])
        ],
      });

      console.log('Updated user evaluations:', updatedEvaluations);

      // Redirect to dashboard after updating
      router.push('/dashboard');
    }
  }, [user, evaluationLevel, updateUserProgress, router]);

  useEffect(() => {
    if (isComplete && results && user) {
      console.log('handleEvaluationComplete called', results);
      const newEvaluation = {
        date: new Date().toISOString(),
        levelTested: evaluationLevel,
        score: results.score,
        totalQuestions: results.totalQuestions,
        wordsTested: [...results.correctWords, ...results.incorrectAnswers.map(a => a.word)],
        incorrect: results.incorrectAnswers.map(a => a.word),
      };

      console.log('New evaluation:', newEvaluation);
      console.log('Current user evaluations:', user.comprehensiveEvaluations);

      const updatedEvaluations = [...(user.comprehensiveEvaluations || []), newEvaluation];

      console.log('Updating user progress with:', {
        comprehensiveEvaluations: updatedEvaluations,
        totalWordsAttempted: user.totalWordsAttempted + results.totalQuestions,
        totalCorrectAttempts: user.totalCorrectAttempts + results.score,
        averageTimePerWord: (
          (user.averageTimePerWord * user.totalWordsAttempted + results.averageTimePerWord * results.totalQuestions) /
          (user.totalWordsAttempted + results.totalQuestions)
        ),
        challengingWords: [
          ...new Set([...user.challengingWords, ...results.incorrectAnswers.map(a => a.word)])
        ],
      });

      updateUserProgress({
        comprehensiveEvaluations: updatedEvaluations,
        totalWordsAttempted: user.totalWordsAttempted + results.totalQuestions,
        totalCorrectAttempts: user.totalCorrectAttempts + results.score,
        averageTimePerWord: (
          (user.averageTimePerWord * user.totalWordsAttempted + results.averageTimePerWord * results.totalQuestions) /
          (user.totalWordsAttempted + results.totalQuestions)
        ),
        challengingWords: [
          ...new Set([...user.challengingWords, ...results.incorrectAnswers.map(a => a.word)])
        ],
      });

      console.log('Updated user evaluations:', updatedEvaluations);

      // Redirect to dashboard after updating
      router.push('/dashboard');
    }
  }, [isComplete, results, user, evaluationLevel, updateUserProgress, router]);

  if (isComplete) {
    return <div>Assessment complete. Redirecting to dashboard...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comprehensive Evaluation</h2>
      <p className="mb-4">This evaluation will test your knowledge of words from the previous ten levels.</p>
      <AssessmentMode 
        levelId={evaluationLevel.toString()} 
        assessmentType="comprehensive" 
        onComplete={handleAssessmentComplete}
      />
    </div>
  )
}

export default ComprehensiveEvaluation