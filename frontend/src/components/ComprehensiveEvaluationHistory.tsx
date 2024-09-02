// src/components/ComprehensiveEvaluationHistory.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';

interface ComprehensiveEvaluationHistoryProps {
  onRemoveChallengingWord: (word: string) => void;
}

const ComprehensiveEvaluationHistory: React.FC<ComprehensiveEvaluationHistoryProps> = ({ onRemoveChallengingWord }) => {
  const { user } = useUser();
  const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);

  const renderStars = useCallback((score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) {
      return '⭐️⭐️⭐️';
    } else if (percentage >= 80) {
      return '⭐️⭐️';
    } else if (percentage >= 70) {
      return '⭐️';
    } else {
      return '☆';
    }
  }, []);

  const sortedEvaluations = useMemo(() => {
    return user?.comprehensiveEvaluations?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  }, [user?.comprehensiveEvaluations]);

  if (!user || sortedEvaluations.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comprehensive Evaluation History</h2>
      {sortedEvaluations.map((evaluation, index) => {
        const isExpanded = expandedEvaluation === evaluation.date;
        return (
          <div key={index} className="mb-4 border rounded p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Level {evaluation.level} {evaluation.type === 'bonus' ? 'Bonus' : 'Core'}
                <span className="ml-4">
                  {renderStars(evaluation.score, evaluation.totalQuestions)}
                </span>
                <span className="ml-2">
                  {Math.round((evaluation.score / evaluation.totalQuestions) * 100)}%
                </span>
              </h3>
              <div>
                <span className="mr-4">{new Date(evaluation.date).toLocaleDateString()}</span>
                <button
                  onClick={() => setExpandedEvaluation(isExpanded ? null : evaluation.date)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
            </div>
            {isExpanded && evaluation.incorrect.length > 0 && (
              <div className="mt-2">
                <ul>
                  {evaluation.incorrect.map((word, wordIndex) => (
                    <li key={wordIndex} className="flex justify-between items-center text-red-500">
                      <span>{word}</span>
                      {user.challengingWords.includes(word) && (
                        <button
                          onClick={() => onRemoveChallengingWord(word)}
                          className="text-gray-500 hover:text-red-700"
                          title="Remove from Challenging Words"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ComprehensiveEvaluationHistory);