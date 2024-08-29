// src/components/ComprehensiveEvaluationHistory.tsx
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { PiExam } from "react-icons/pi";

const ComprehensiveEvaluationHistory: React.FC = () => {
  const { user, updateUserProgress } = useUser();
  const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
  console.log('ComprehensiveEvaluationHistory user:', user);
  console.log('ComprehensiveEvaluationHistory evaluations:', user?.comprehensiveEvaluations);

  const handleRemoveFromChallenging = (word: string) => {
    if (user) {
      updateUserProgress({
        challengingWords: user.challengingWords.filter(w => w !== word),
      });
    }
  };

  const renderStars = (score: number, totalQuestions: number) => {
    const starCount = Math.round((score / totalQuestions) * 3);
    return '⭐️'.repeat(starCount);
  };

  if (!user || user.comprehensiveEvaluations.length === 0) {
    return;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comprehensive Evaluation History</h2>
      {/* <Link href="/comprehensive-evaluation" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block mb-4">
        <div className="flex items-center space-x-2">
          <PiExam size={24} className="flex-shrink-0" />
          <span>Start New Test</span>
        </div>
      </Link> */}
      {user.comprehensiveEvaluations.map((evaluation, index) => {
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
                          onClick={() => handleRemoveFromChallenging(word)}
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

export default ComprehensiveEvaluationHistory;