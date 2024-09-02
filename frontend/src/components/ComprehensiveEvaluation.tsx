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

interface ComprehensiveEvaluationProps {
  level: string;
  type: 'core' | 'bonus';
}

const ComprehensiveEvaluation: React.FC<ComprehensiveEvaluationProps> = ({ level, type }) => {
  const { user, updateUserProgress } = useUser()
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<AssessmentResults | null>(null)

  const handleAssessmentComplete = useCallback((results: AssessmentResults) => {
    if (user) {
      const newEvaluation = {
        date: new Date().toISOString(),
        level,
        type,
        score: results.score,
        totalQuestions: results.totalQuestions,
        wordsTested: [...results.correctWords, ...results.incorrectAnswers.map(a => a.word)],
        incorrect: results.incorrectAnswers.map(a => a.word),
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
          ...new Set([...user.challengingWords, ...results.incorrectAnswers.map(a => a.word)])
        ],
      });

      setResults(results);
      setIsComplete(true);
    }
  }, [user, updateUserProgress, level, type]);

  useEffect(() => {
    if (isComplete) {
      router.push('/dashboard');
    }
  }, [isComplete, router]);

  if (isComplete) {
    return <div>Assessment complete. Redirecting to dashboard...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comprehensive Evaluation</h2>
      <p className="mb-4">This evaluation will test your knowledge of words from the previous ten levels.</p>
      <AssessmentMode 
        levelId={level} 
        assessmentType="comprehensive" 
        onComplete={handleAssessmentComplete}
        comprehensiveType={type}
      />
    </div>
  )
}

export default ComprehensiveEvaluation