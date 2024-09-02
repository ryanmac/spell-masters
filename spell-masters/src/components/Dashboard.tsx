// src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import ComprehensiveEvaluationHistory from '@/components/ComprehensiveEvaluationHistory'
import LevelProgress from '@/components/LevelProgress'
import Link from 'next/link'
import { FaPencilAlt, FaBrain } from 'react-icons/fa'
import { PiExam } from "react-icons/pi";

const Dashboard: React.FC = () => {
  const { user, updateUserProgress } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useLocalStorage<Record<string, boolean>>('expandedLevels', {});
  const hasExpandedLevelsRef = useRef(false);

  const renderStars = useMemo(() => (stars: number) => '⭐'.repeat(stars) || '☆☆☆', []);

  const {
    highestLevel,
    wordsMastered,
    unlockedLevels,
    totalStars,
    completedCore,
    completedBonus,
    accuracyRate,
    averageTimePerWord,
    challengingWordsCount
  } = useMemo(() => {
    if (!user) return {
      highestLevel: { level: '1', type: 'core' as const },
      wordsMastered: 0,
      unlockedLevels: [],
      totalStars: 0,
      completedCore: 0,
      completedBonus: 0,
      accuracyRate: 0,
      averageTimePerWord: 0,
      challengingWordsCount: 0
    };

    let maxLevel = 1;
    let maxType: 'core' | 'bonus' = 'core';
    let totalMasteredWords = 0;
    let unlockedLevels: string[] = [];

    Object.entries(user.levelProgress).forEach(([level, { core, bonus }]) => {
      const coreMax = Math.max(...core.map(p => p.sublevel), 0);
      const bonusMax = Math.max(...bonus.map(p => p.sublevel), 0);

      if (parseInt(level) > maxLevel || (parseInt(level) === maxLevel && (coreMax > 0 || bonusMax > 0))) {
        maxLevel = parseInt(level);
        maxType = coreMax >= bonusMax ? 'core' : 'bonus';
      }

      totalMasteredWords += core.reduce((total, progress) => total + progress.words.length, 0);

      if (core.some(progress => progress.completed)) {
        unlockedLevels.push(level);
      }
    });

    return {
      highestLevel: { level: maxLevel.toString(), type: maxType },
      wordsMastered: totalMasteredWords,
      unlockedLevels,
      totalStars: user.totalStars,
      completedCore: user.completedCore,
      completedBonus: user.completedBonus,
      accuracyRate: user.accuracyRate,
      averageTimePerWord: user.averageTimePerWord,
      challengingWordsCount: user.challengingWords.length
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  useEffect(() => {
    if (user && highestLevel.level !== '1' && !hasExpandedLevelsRef.current) {
      setExpandedLevels(prev => ({
        ...prev,
        [`${highestLevel.level}-core`]: true,
        [`${highestLevel.level}-bonus`]: true,
      }));
      hasExpandedLevelsRef.current = true;
    }
  }, [highestLevel, user]);

  const handleLevelToggle = useCallback((level: string, type: string, isExpanded: boolean) => {
    setExpandedLevels(prev => ({ ...prev, [`${level}-${type}`]: isExpanded }));
  }, [setExpandedLevels]);

  const getHighestComprehensiveStars = useMemo(() => {
    return (level: string, type: 'core' | 'bonus') => {
      if (!user || !user.comprehensiveEvaluations) return 0;
      const relevantEvaluations = user.comprehensiveEvaluations.filter(
        evaluation => evaluation.level === level && evaluation.type === type
      );
      if (relevantEvaluations.length === 0) return 0;
      return Math.max(...relevantEvaluations.map(evaluation => Math.floor((evaluation.score / evaluation.totalQuestions) * 3)));
    };
  }, [user]);

  const renderLevels = useMemo(() => {
    if (!user) return null;
    return Array.from({ length: 13 }, (_, i) => i + 1).map((level) => (
      <React.Fragment key={level}>
        <LevelProgress 
          level={level.toString()} 
          type="core" 
          progress={user.levelProgress[level]?.core || []}
          isExpanded={expandedLevels[`${level}-core`] || false}
          onToggle={handleLevelToggle}
        />
        <div className="mb-2">
          <Link href={`/comprehensive-evaluation/${level}?type=core`} className="block w-full text-center p-2 bg-green-500 text-white rounded hover:bg-green-600">
            Test Level {level} Core {renderStars(getHighestComprehensiveStars(level.toString(), 'core'))}
          </Link>
        </div>
        <LevelProgress 
          level={level.toString()} 
          type="bonus" 
          progress={user.levelProgress[level]?.bonus || []}
          isExpanded={expandedLevels[`${level}-bonus`] || false}
          onToggle={handleLevelToggle}
        />
        <div className="mb-4">
          <Link href={`/comprehensive-evaluation/${level}?type=bonus`} className="block w-full text-center p-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Test Level {level} Bonus {renderStars(getHighestComprehensiveStars(level.toString(), 'bonus'))}
          </Link>
        </div>
      </React.Fragment>
    ));
  }, [user, expandedLevels, handleLevelToggle, getHighestComprehensiveStars, renderStars]);

  const hasChallengeWords = useMemo(() => challengingWordsCount > 0, [challengingWordsCount]);

  const handleResetChallengingWords = useCallback(() => {
    if (user) {
      updateUserProgress({
        challengingWords: [],
      });
    }
  }, [user, updateUserProgress]);

  const handleRemoveFromChallenging = useCallback((word: string) => {
    if (user) {
      updateUserProgress({
        challengingWords: user.challengingWords.filter(w => w !== word),
      });
    }
  }, [user, updateUserProgress]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">
          Your Progress
        </h3>
        <div className="bg-blue-500 p-4 rounded">
          <p>Total Stars: {totalStars} ({completedCore} Core / {completedBonus} Bonus)</p>
          <p>Completed: {completedCore + completedBonus} ({completedCore} Core / {completedBonus} Bonus)</p>
          <p>Words Mastered: {wordsMastered}</p>
          <p>Accuracy Rate: {accuracyRate.toFixed(0)}%</p>
          <p>Average Time per Word: {averageTimePerWord.toFixed(1)} seconds</p>
          <p>Challenging Words: {challengingWordsCount}
            <button onClick={handleResetChallengingWords} className="ml-2 px-2 py-1 text-sm text-red-500 rounded hover:text-red-600 border-0">
              ❌
            </button>
          </p>
        </div>
      </div>
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          {hasChallengeWords && (
            <Link href="/targeted-reinforcement" className="p-4 bg-red-500 text-white rounded hover:bg-red-600 text-center">
              <div className="flex items-center space-x-2">
                <FaBrain size={24} className="flex-shrink-0" />
                <span>Practice</span>
              </div>
            </Link>
          )}
          {hasChallengeWords && (
            <Link href="/trace" className="p-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-center">
              <div className="flex items-center space-x-2">
                <FaPencilAlt size={24} className="flex-shrink-0" />
                <span>Trace</span>
              </div>
            </Link>
          )}
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Levels</h3>
        <div className="grid grid-cols-1 gap-4">
          {renderLevels}
        </div>
      </div>
      <ComprehensiveEvaluationHistory onRemoveChallengingWord={handleRemoveFromChallenging} />
    </div>
  );
};

Dashboard.displayName = 'Dashboard';

export default React.memo(Dashboard);