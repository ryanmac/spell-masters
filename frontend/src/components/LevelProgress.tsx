// src/components/LevelProgress.tsx
import React, { useCallback } from 'react'
import Link from 'next/link'

interface LevelProgressProps {
  level: string;
  type: 'core' | 'bonus';
  progress: any[]; // Consider creating a more specific type for this
  isExpanded: boolean;
  onToggle: (level: string, type: string, isExpanded: boolean) => void;
}

const LevelProgress: React.FC<LevelProgressProps> = React.memo(({ level, type, progress, isExpanded, onToggle }) => {
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

LevelProgress.displayName = 'LevelProgress';

export default LevelProgress;