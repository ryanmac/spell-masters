// src/components/AssessmentMode.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useWord } from '@/hooks/useWord'
import { useMisspelling } from '@/hooks/useMisspelling'
import { useTTS } from '@/hooks/useTTS'
import { useUser, User } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { scheduleWordForReview, updateReviewSchedule } from '@/utils/spacedRepetition'
import { getStarRating } from '@/utils/starRating'
import { FaVolumeUp } from 'react-icons/fa'

type AssessmentType = 'core' | 'bonus' | 'comprehensive';

interface AssessmentResults {
  score: number;
  totalQuestions: number;
  incorrectAnswers: IncorrectAnswer[];
  correctWords: string[];
  averageTimePerWord: number;
}

interface AssessmentModeProps {
  levelId: string
  assessmentType: AssessmentType
  sublevel?: number
  onComplete?: (results: AssessmentResults) => void
}

interface IncorrectAnswer {
  word: string
  userChoice: string
  correctChoice: string
}

const ALWAYS_SHOW_CORRECT_FIRST = false
const WORDS_PER_ASSESSMENT = 20

const AssessmentMode: React.FC<AssessmentModeProps> = ({ levelId, assessmentType, sublevel = 1, onComplete }) => {
  console.log('AssessmentMode rendered with props:', { levelId, assessmentType, sublevel, onComplete: !!onComplete });
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([])
  const [correctWords, setCorrectWords] = useState<string[]>([])
  const navigationOccurredRef = useRef(false)
  const [exampleSentence, setExampleSentence] = useState<string>("_____");

  const { wordInfo } = useWord(words[currentWordIndex] || '')
  const { generateMisspellings } = useMisspelling()
  const { speak, stop, speaking } = useTTS()
  const { user, updateUserProgress, updateLevelProgress } = useUser()
  const router = useRouter()

  const answeredRef = useRef(false)

  const fetchWords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Ensure the sublevel is correctly used in the API call
      const response = await fetch(`/api/words?level=${levelId}&type=${assessmentType}&sublevel=${sublevel}&count=${WORDS_PER_ASSESSMENT}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.words && data.words.length > 0) {
        setWords(data.words);
      } else {
        throw new Error('No words received from the server');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to load words. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [levelId, assessmentType, sublevel]);

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const fetchExampleSentence = useCallback(async (word: string) => {
    try {
      const response = await fetch(`/api/sentences?word=${word}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.sentence || "_____";
    } catch (error) {
      console.error('Error fetching example sentence:', error);
      return "_____";
    }
  }, []);

  useEffect(() => {
    if (wordInfo && wordInfo.word) {
      fetchExampleSentence(wordInfo.word).then(sentence => {
        setExampleSentence(sentence);
      });
    }
  }, [wordInfo, fetchExampleSentence]);

  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      const correctWord = words[currentWordIndex];
      const misspellings = generateMisspellings(correctWord, 3);
      let answerOptions = [correctWord, ...misspellings];
      if (!ALWAYS_SHOW_CORRECT_FIRST) {
        answerOptions = answerOptions.sort(() => Math.random() - 0.5);
      }
      setOptions(answerOptions);
      setStartTime(Date.now());
      answeredRef.current = false;
      
      // Check if word is new only if it's not already in the mastered list
      if (user) {
        const isNewWord = !Object.entries(user.levelProgress).some(([lvl, progress]) => {
            // Iterate through the core or bonus arrays to check completed status
            const levelProgress = progress.core.find(p => p.sublevel === sublevel && p.completed);
            const isWordMastered = levelProgress?.words.includes(correctWord);
  
            // Debugging: Log the progress check
            // console.log(`Level: ${lvl}, Sublevel: ${sublevel}, Correct Word: ${correctWord}, Mastered: ${isWordMastered}`);
            
            return levelProgress && isWordMastered;
        });
  
        // Debugging: Log if the word is new or not
        // console.log(`Word "${correctWord}" is ${isNewWord ? 'new' : 'already mastered'}.`);
      }
    }
  }, [words, currentWordIndex, generateMisspellings, user, levelId, sublevel]);

  const handleAnswer = useCallback((selectedOption: string) => {
    if (answeredRef.current) return
    answeredRef.current = true

    setSelectedAnswer(selectedOption)
    setShowFeedback(true)
    const endTime = Date.now()
    const timeTaken = (endTime - startTime) / 1000
    setTotalTime(prevTotal => prevTotal + timeTaken)

    const isCorrect = selectedOption === words[currentWordIndex]
    if (isCorrect) {
      setScore(prevScore => prevScore + 1)
      setCorrectWords(prev => [...prev, words[currentWordIndex]])
      // Remove the word from challengingWords if it was correct
      if (user && user.challengingWords.includes(words[currentWordIndex])) {
        updateUserProgress({
          challengingWords: user.challengingWords.filter(word => word !== words[currentWordIndex])
        })
      }
    } else {
      setIncorrectAnswers(prev => [...prev, {
        word: words[currentWordIndex],
        userChoice: selectedOption,
        correctChoice: words[currentWordIndex]
      }])
    }

    if (user) {
      let updatedUser = updateReviewSchedule(user, words[currentWordIndex], isCorrect)
      if (!isCorrect) {
        updatedUser = scheduleWordForReview(updatedUser, words[currentWordIndex])
      }
      updateUserProgress(updatedUser)
    }

    // Delay moving to the next word to show feedback
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prevIndex => prevIndex + 1)
      } else {
        setAssessmentComplete(true)
      }
    }, 500)
  }, [currentWordIndex, startTime, words, user, updateUserProgress, assessmentType, incorrectAnswers, levelId, onComplete, sublevel]);

  const handleSpeak = useCallback(() => {
    if (wordInfo) {
      speak(wordInfo.word)
    }
  }, [wordInfo, speak])

  // Ensure correct update of uniqueWordsMastered and level progress
  const handleAssessmentComplete = useCallback(() => {
    console.log('handleAssessmentComplete called');
    if (assessmentComplete && user) {
      const starRating = getStarRating(score, words.length);
  
      // Ensure the level exists in user.levelProgress
      if (!user.levelProgress[levelId]) {
        // Initialize the level progress if it doesn't exist
        user.levelProgress[levelId] = {
          core: [],
          bonus: []
        };
      }
  
      const newMasteredWords = correctWords.filter(word => {
        return !user.levelProgress[levelId].core.some(progress => 
          progress.words.includes(word)
        );
      });
  
      // Update level progress with correct words
      if (assessmentType === "core" || assessmentType === "bonus") {
        updateLevelProgress(levelId, assessmentType, sublevel, starRating, starRating > 0, newMasteredWords);
      }
  
      // Update user progress
      const updatedUserProgress: Partial<User> = {
        uniqueWordsMastered: user.uniqueWordsMastered + newMasteredWords.length,
        totalWordsAttempted: user.totalWordsAttempted + words.length,
        totalCorrectAttempts: user.totalCorrectAttempts + score,
        averageTimePerWord: ((user.averageTimePerWord * user.totalWordsAttempted) + totalTime) / (user.totalWordsAttempted + words.length),
        challengingWords: [...new Set([...user.challengingWords, ...incorrectAnswers.map(a => a.word)])],
      };

      if (onComplete) {
        console.log('Calling onComplete with results:', {
          score,
          totalQuestions: words.length,
          incorrectAnswers,
          correctWords,
          averageTimePerWord: totalTime / words.length,
        });
        onComplete({
          score,
          totalQuestions: words.length,
          incorrectAnswers,
          correctWords,
          averageTimePerWord: totalTime / words.length,
        });
      } else {
        console.log('onComplete not provided, skipping');
      }
  
      updateUserProgress(updatedUserProgress);
    }
  }, [assessmentComplete, user, updateLevelProgress, updateUserProgress, words, correctWords, score, totalTime]);

  useEffect(() => {
    if (assessmentComplete && user && !navigationOccurredRef.current) {
      console.log('Assessment complete effect triggered');
      handleAssessmentComplete();
      navigationOccurredRef.current = true;
    
      const assessmentResults = {
        score,
        totalQuestions: words.length,
        averageTimePerWord: totalTime / words.length,
        incorrectAnswers,
        correctWords,
        starRating: getStarRating(score, words.length),
      };
    
      console.log('Assessment complete, calling onComplete');
      if (onComplete) {
        console.log('Calling onComplete with results:', assessmentResults);
        onComplete(assessmentResults);
      }
    
      router.push(`/performance-review?results=${encodeURIComponent(JSON.stringify(assessmentResults))}`);
    }
  }, [assessmentComplete, user, handleAssessmentComplete, onComplete, score, words.length, totalTime, incorrectAnswers, correctWords, router]);

  useEffect(() => {
    if (navigationOccurredRef.current) {
      const assessmentResults = {
        score,
        totalQuestions: words.length,
        averageTimePerWord: totalTime / words.length,
        incorrectAnswers,
        correctWords,
        starRating: getStarRating(score, words.length),
      }
      router.push(`/performance-review?results=${encodeURIComponent(JSON.stringify(assessmentResults))}`)
    }
  }, [navigationOccurredRef.current])

  if (isLoading) {
    return <div className="text-center mt-8">Loading assessment...</div>
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchWords}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (words.length === 0) {
    return <div className="text-center mt-8">No words available for this level and type.</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* <h2 className="text-2xl font-bold mb-4">Assessment Mode</h2> */}
      <p className="mb-2">Question {currentWordIndex + 1} of {words.length}</p>
      <p className="mb-4">Score: {score}</p>
      {wordInfo && (
        <div className="mb-4">
          <div
            className="text-lg font-semibold"
            style={{ height: '4.5rem' }}
          >
            {exampleSentence}
          </div>
          <button
            onClick={handleSpeak}
            disabled={speaking}
            className={`mt-2 p-2 rounded-full transition-colors duration-200 ${
              speaking ? 'text-gray-400' : 'text-white hover:text-blue-300'
            }`}
            aria-label={speaking ? 'Speaking' : 'Speak Word'}
          >
            <FaVolumeUp size={24} />
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`p-6 text-lg font-semibold rounded-lg text-center ${
              showFeedback
                ? option === words[currentWordIndex]
                  ? 'bg-green-500 text-white'
                  : option === selectedAnswer
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-500'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={showFeedback}
          >
            {option}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className="mt-4 text-center">
          <p className={selectedAnswer === words[currentWordIndex] ? "text-green-500" : "text-red-500"}>
            {selectedAnswer === words[currentWordIndex] ? "Correct!" : `Incorrect. The correct answer is: ${words[currentWordIndex]}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default AssessmentMode