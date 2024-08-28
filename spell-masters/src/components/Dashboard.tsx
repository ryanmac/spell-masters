// src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ComprehensiveEvaluationHistory from '@/components/ComprehensiveEvaluationHistory';
import Link from 'next/link';

const LevelProgress: React.FC<{ 
  level: string; 
  type: 'core' | 'bonus'; 
  progress: any[];
  isExpanded: boolean;
  onToggle: (level: string, type: string, isExpanded: boolean) => void;
}> = React.memo(({ level, type, progress, isExpanded, onToggle }) => {
  const sublevels = type === 'core' ? 20 : 10;

  const renderStars = (stars: number) => '⭐'.repeat(stars) || '☆☆☆';

  const handleToggle = useCallback(() => {
    onToggle(level, type, !isExpanded);
  }, [level, type, isExpanded, onToggle]);

  return (
    <div className="mb-4 rounded-lg overflow-hidden shadow-sm">
      <button
        className={`w-full text-left p-3 ${type === 'core' ? 'bg-blue-600' : 'bg-purple-600'} text-white font-semibold`}
        onClick={handleToggle}
      >
        <span>{`Level ${level}${type === 'bonus' ? ' Bonus' : ''}`}</span>
        <span className="float-right">{isExpanded ? '▲' : '▼'}</span>
      </button>
      {isExpanded && (
        <div className="p-2 bg-gray-100">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: sublevels }, (_, i) => i + 1).map((sublevel) => {
              const subProgress = progress.find((p: any) => p.sublevel === sublevel);
              const isUnlocked = subProgress || (sublevel === 1) || progress.some((p: any) => p.sublevel === sublevel - 1 && p.completed);

              return (
                <Link
                  key={`${level}-${type}-${sublevel}`}
                  href={isUnlocked ? `/assessment/${level}?type=${type}&sublevel=${sublevel}` : '#'}
                  className={`block text-center p-2 rounded ${
                    isUnlocked
                      ? subProgress
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium">{`${level}-${sublevel}`}</div>
                  <div className="text-sm">
                    {subProgress ? renderStars(subProgress.stars) : isUnlocked ? 'Start' : '🔒'}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useLocalStorage<Record<string, boolean>>('expandedLevels', {});
  const [highestLevel, setHighestLevel] = useState<{ level: string, type: 'core' | 'bonus' }>({ level: '1', type: 'core' });

  const [wordsMastered, setWordsMastered] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.levelProgress) {
      let maxLevel = 1;
      let maxType: 'core' | 'bonus' = 'core';

      Object.entries(user.levelProgress).forEach(([level, { core, bonus }]) => {
        const coreMax = Math.max(...core.map(p => p.sublevel), 0);
        const bonusMax = Math.max(...bonus.map(p => p.sublevel), 0);

        if (parseInt(level) > maxLevel || (parseInt(level) === maxLevel && (coreMax > 0 || bonusMax > 0))) {
          maxLevel = parseInt(level);
          maxType = coreMax >= bonusMax ? 'core' : 'bonus';
        }
      });

      setHighestLevel({ level: maxLevel.toString(), type: maxType });
    }
  }, [user?.levelProgress]);

  useEffect(() => {
    if (highestLevel.level !== '1') {
      setExpandedLevels(prev => ({
        ...prev,
        [`${highestLevel.level}-core`]: true,
        [`${highestLevel.level}-bonus`]: true,
      }));
    }
  }, [highestLevel, setExpandedLevels]);

  const handleLevelToggle = useCallback((level: string, type: string, isExpanded: boolean) => {
    setExpandedLevels(prev => ({ ...prev, [`${level}-${type}`]: isExpanded }));
  }, [setExpandedLevels]);

  const calculateDashboardStats = useCallback((user: any) => {
    const masteredWords = Object.values(user.levelProgress).reduce((total, level: any) => {
      return total + level.core.reduce((coreTotal: number, progress: any) => coreTotal + progress.words.length, 0);
    }, 0);
  
    const unlockedLevels = Object.keys(user.levelProgress).filter((levelId: string) => {
      return user.levelProgress[levelId].core.some((progress: any) => progress.completed);
    });
  
    setWordsMastered(masteredWords as number);
    setUnlockedLevels(unlockedLevels);
  }, []);
  
  useEffect(() => {
    if (user) {
      console.log('Dashboard mounted/updated, user data:', user);
      console.log('Comprehensive evaluations:', user.comprehensiveEvaluations);
      setIsLoading(false);
      calculateDashboardStats(user);
    } else {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, router, calculateDashboardStats]);

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
        <LevelProgress 
          level={level.toString()} 
          type="bonus" 
          progress={user.levelProgress[level]?.bonus || []}
          isExpanded={expandedLevels[`${level}-bonus`] || false}
          onToggle={handleLevelToggle}
        />
      </React.Fragment>
    ));
  }, [user, expandedLevels, handleLevelToggle]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  console.log('Dashboard user:', user);
  console.log('Comprehensive evaluations:', user?.comprehensiveEvaluations);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">
          Your Progress
        </h3>
        <div className="bg-blue-400 p-4 rounded">
          <p>Current Grade: {user.grade}</p>
          <p>Total Stars: {user.totalStars} ({user.completedCore} Core / {user.completedBonus} Bonus)</p>
          <p>Completed: {user.completedCore + user.completedBonus} ({user.completedCore} Core / {user.completedBonus} Bonus)</p>
          <p>Words Mastered: {wordsMastered}</p>
          <p>Accuracy Rate: {user.accuracyRate.toFixed(2)}%</p>
          <p>Average Time per Word: {user.averageTimePerWord.toFixed(2)} seconds</p>
          <p>Challenging Words: {user.challengingWords.length}</p>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Learning Modes</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* <Link href={`/assessment/${user.grade}?type=core`} className="p-4 bg-green-500 text-white rounded hover:bg-green-600 text-center">
            Start Assessment
          </Link> */}
          {user.challengingWords.length > 0 && (
            <Link href="/kinesthetic-practice" className="p-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-center">
              Kinesthetic Practice
            </Link>
          )}
          {user.challengingWords.length > 0 && (
            <Link href="/targeted-reinforcement" className="p-4 bg-red-500 text-white rounded hover:bg-red-600 text-center">
              Targeted Reinforcement
            </Link>
          )}
          {/* <Link href={`/assessment/${user.grade}?type=bonus`} className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600 text-center">
            Bonus Challenges
          </Link> */}
          <Link href="/comprehensive-evaluation" className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-center">
            Comprehensive Evaluation
          </Link>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Levels</h3>
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((level) => (
            <React.Fragment key={level}>
              <LevelProgress 
                level={level.toString()} 
                type="core" 
                progress={user.levelProgress[level]?.core || []}
                isExpanded={expandedLevels[`${level}-core`] || false}
                onToggle={handleLevelToggle}
              />
              <LevelProgress 
                level={level.toString()} 
                type="bonus" 
                progress={user.levelProgress[level]?.bonus || []}
                isExpanded={expandedLevels[`${level}-bonus`] || false}
                onToggle={handleLevelToggle}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
      <ComprehensiveEvaluationHistory />
    </div>
  );
};

export default Dashboard;