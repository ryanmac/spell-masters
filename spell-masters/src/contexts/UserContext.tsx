// src/contexts/UserContext.tsx
'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProgress: (progressData: Partial<User>) => void;
  updateLevelProgress: (level: string, type: 'core' | 'bonus', sublevel: number, stars: number, completed: boolean, words: string[]) => void;
  logout: () => void;
}

export interface Review {
  word: string;
  reviewDate: string; // ISO string format
}

export interface LevelProgress {
  sublevel: number;
  stars: number;
  words: string[];
  completed: boolean;
}

export interface User {
  name: string;
  grade: number;
  avatar: string;
  uniqueWordsMastered: number;
  totalStars: number;
  accuracyRate: number;
  averageTimePerWord: number;
  challengingWords: string[];
  completedCore: number;
  completedBonus: number;
  bonusProgress: {
    [key: string]: {
      completed: boolean;
      stars: number;
      wordsMastered: number;
    }
  };
  comprehensiveEvaluations: {
    date: string;
    levelTested: number;
    score: number;
    totalQuestions: number;
    wordsTested: string[];
    incorrect: string[];
  }[];
  scheduledReviews?: Review[];
  levelProgress: {
    [key: string]: {
      core: LevelProgress[];
      bonus: LevelProgress[];
    }
  };
  totalWordsAttempted: number;
  totalCorrectAttempts: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProgress: (progressData: Partial<User>) => void;
  updateLevelProgress: (level: string, type: 'core' | 'bonus', sublevel: number, stars: number, completed: boolean, words: string[]) => void;
  removeUser: (userName: string) => void;
  getAllUsers: () => User[];
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<Record<string, User>>('users', {})
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('currentUserId', null)
  const [user, setUserState] = useState<User | null>(null)

  useEffect(() => {
    if (currentUserId && users[currentUserId]) {
      setUserState(users[currentUserId])
    } else {
      setUserState(null)
    }
  }, [currentUserId, users])

  const setUser = useCallback((newUser: User | null) => {
    if (newUser) {
      setUsers(prevUsers => ({
        ...prevUsers,
        [newUser.name]: newUser
      }))
      setCurrentUserId(newUser.name)
    } else {
      setCurrentUserId(null)
    }
  }, [setUsers, setCurrentUserId])

  const updateUserProgress = useCallback((progressData: Partial<User>) => {
    setUsers(prevUsers => {
      if (user) {
        const updatedUser = { ...user, ...progressData }
        console.log('Updating user progress, received data:', progressData);

        if (progressData.challengingWords) {
          // Ensure unique values in challengingWords
          updatedUser.challengingWords = Array.from(new Set(updatedUser.challengingWords));
        }

        // Recalculate accuracy rate
        if (updatedUser.totalWordsAttempted > 0) {
          updatedUser.accuracyRate = (updatedUser.totalCorrectAttempts / updatedUser.totalWordsAttempted) * 100;
        }

        // Handle comprehensiveEvaluations separately
        if (progressData.comprehensiveEvaluations) {
          updatedUser.comprehensiveEvaluations = progressData.comprehensiveEvaluations;
          console.log('Updated comprehensiveEvaluations:', updatedUser.comprehensiveEvaluations);
        }

        // Recalculate total stars
        updatedUser.totalStars = Object.values(updatedUser.levelProgress).reduce((total, level) => {
          return total + 
            level.core.reduce((levelTotal, sublevel) => levelTotal + sublevel.stars, 0) +
            level.bonus.reduce((levelTotal, sublevel) => levelTotal + sublevel.stars, 0);
        }, 0);

        // Recalculate completed core and bonus
        updatedUser.completedCore = Object.values(updatedUser.levelProgress).reduce((total, level) => {
          return total + level.core.filter(sublevel => sublevel.completed).length;
        }, 0);
        updatedUser.completedBonus = Object.values(updatedUser.levelProgress).reduce((total, level) => {
          return total + level.bonus.filter(sublevel => sublevel.completed).length;
        }, 0);

        // Recalculate unique words mastered
        updatedUser.uniqueWordsMastered = Object.values(updatedUser.levelProgress).reduce((total, level) => {
          const coreWords = level.core.reduce((wordTotal, sublevel) => wordTotal + sublevel.words.length, 0);
          const bonusWords = level.bonus.reduce((wordTotal, sublevel) => wordTotal + sublevel.words.length, 0);
          return total + coreWords + bonusWords;
        }, 0);

        console.log('Final updated user:', updatedUser);
        return { ...prevUsers, [user.name]: updatedUser }
      }
      return prevUsers;
    });
  }, [setUsers, user])

  const updateLevelProgress = useCallback((level: string, type: 'core' | 'bonus', sublevel: number, stars: number, completed: boolean, words: string[]) => {
    setUsers(prevUsers => {
      if (user) {
        const updatedUser = { ...user };
        const newLevelProgress = { ...updatedUser.levelProgress };
        if (!newLevelProgress[level]) {
          newLevelProgress[level] = { core: [], bonus: [] };
        }
        const progress: LevelProgress[] = newLevelProgress[level][type];
        const existingIndex = progress.findIndex(p => p.sublevel === sublevel);
        if (existingIndex !== -1) {
          progress[existingIndex] = { 
            ...progress[existingIndex],
            stars: Math.max(progress[existingIndex].stars, stars),
            completed: completed || progress[existingIndex].completed,
            words: Array.from(new Set([...progress[existingIndex].words, ...words])) // Avoid double counting words
          };
        } else {
          progress.push({ sublevel, stars, completed, words: Array.from(new Set(words)) });
        }
  
        // Ensure sublevels are in order and fill gaps
        progress.sort((a, b) => a.sublevel - b.sublevel);
        for (let i = 1; i <= sublevel; i++) {
          if (!progress.find(p => p.sublevel === i)) {
            progress.push({ sublevel: i, stars: 0, words: [], completed: false });
          }
        }
  
        updatedUser.levelProgress = newLevelProgress;
        return { ...prevUsers, [user.name]: updatedUser };
      }
      return prevUsers;
    });
  }, [setUsers, user]);

  const removeUser = useCallback((userName: string) => {
    setUsers(prevUsers => {
      const newUsers = { ...prevUsers }
      delete newUsers[userName]
      return newUsers
    })
    if (currentUserId === userName) {
      setCurrentUserId(null)
    }
  }, [setUsers, currentUserId, setCurrentUserId])

  const getAllUsers = useCallback(() => {
    return Object.values(users)
  }, [users])

  const logout = useCallback(() => {
    setCurrentUserId(null)
  }, [setCurrentUserId])

  return (
    <UserContext.Provider value={{ user, setUser, updateUserProgress, updateLevelProgress, removeUser, getAllUsers, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}