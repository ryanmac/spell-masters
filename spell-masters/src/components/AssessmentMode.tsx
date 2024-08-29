// src/components/AssessmentMode.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useWord } from '@/hooks/useWord'
import { useMisspelling } from '@/hooks/useMisspelling'
import { useTTS } from '@/hooks/useTTS'
import { useUser, User } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { scheduleWordForReview, updateReviewSchedule } from '@/utils/spacedRepetition'
import { getStarRating } from '@/utils/starRating'
import { FaVolumeUp, FaInfo, FaVolumeMute } from 'react-icons/fa'

type AssessmentType = 'core' | 'bonus' | 'comprehensive';

interface AssessmentResults {
  score: number;
  totalQuestions: number;
  incorrectAnswers: IncorrectAnswer[];
  correctWords: string[];
  averageTimePerWord: number;
  predefinedWords?: string[];
}

interface AssessmentModeProps {
  levelId: string;
  assessmentType: AssessmentType;
  sublevel?: number;
  onComplete?: (results: AssessmentResults) => void;
  predefinedWords?: string[];
  comprehensiveType?: 'core' | 'bonus';
}

interface IncorrectAnswer {
  word: string;
  userChoice: string;
  correctChoice: string;
}

const ALWAYS_SHOW_CORRECT_FIRST = false
const WORDS_PER_ASSESSMENT = 20

const AssessmentMode = React.memo<AssessmentModeProps>(({
  levelId,
  assessmentType,
  sublevel = 1,
  onComplete,
  predefinedWords,
  comprehensiveType = 'core',
}) => {
  console.log('AssessmentMode rendered with props:', { levelId, assessmentType, sublevel, predefinedWords, comprehensiveType });

  // States
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const navigationOccurredRef = useRef(false);
  const [exampleSentence, setExampleSentence] = useState<string>("_____");
  const [definition, setDefinition] = useState<string[] | "_____">("_____");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { wordInfo } = useWord(words[currentWordIndex] || '');
  const { generateMisspellings } = useMisspelling();
  const { speak, speakSentence, stop, speaking } = useTTS()
  const { user, updateUserProgress, updateLevelProgress } = useUser();
  const router = useRouter();
  const progress = ((currentWordIndex + 1) / words.length) * 100;

  const answeredRef = useRef(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak(prev => !prev);
    if (!autoSpeak && words[currentWordIndex]) {
      speak(words[currentWordIndex]);
    }
  }, [autoSpeak, words, currentWordIndex, speak]);

  const fetchWords = useCallback(async () => {
    console.log('Fetching words for level:', levelId);
    if (!isInitialLoad) {
      console.log('Not initial load, returning...');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching words from API...');
      const challengingWords = predefinedWords || user?.challengingWords || [];
      const wordCount = assessmentType === 'comprehensive' ? 30 : WORDS_PER_ASSESSMENT;
      const response = await fetch(`/api/words?level=${levelId}&type=${assessmentType}&sublevel=${sublevel}&count=${wordCount}&challengingWords=${encodeURIComponent(JSON.stringify(challengingWords))}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data from API:', data);
      if (data.words && data.words.length > 0) {
        setWords(data.words);
        setIsInitialLoad(false);
      } else {
        throw new Error('No words received from the server');
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to load words. Please try again.');
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  }, [levelId, assessmentType, sublevel, user, isInitialLoad, predefinedWords]);

  const fetchWordData = useCallback(async (word: string) => {
    console.log('Fetching word data for:', word);
    try {
      const response = await fetch(`/api/word-data?word=${word}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        sentence: data.sentence || "_____",
        definition: Array.isArray(data.definitions) && data.definitions.length > 0 ? data.definitions : ["Undefined: No definition available"],
      };
    } catch (error) {
      console.error('Error fetching word data:', error);
      return {
        sentence: "_____",
        definition: ["Undefined: No definition available"],
      };
    }
  }, []);

  const generateOptions = useCallback((word: string) => {
    const misspellings = generateMisspellings(word, 3);
    let answerOptions = [word, ...misspellings];
    if (!ALWAYS_SHOW_CORRECT_FIRST) {
      answerOptions = answerOptions.sort(() => Math.random() - 0.5);
    }
    return answerOptions;
  }, [generateMisspellings]);

  const options = useMemo(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      return generateOptions(words[currentWordIndex]);
    }
    return [];
  }, [words, currentWordIndex, generateOptions]);

  const handleSpeakSentence = useCallback(() => {
    if (wordInfo) {
      speakSentence(exampleSentence, wordInfo.word)
    }
  }, [speakSentence, exampleSentence, wordInfo])

  const handleAnswer = useCallback((selectedOption: string) => {
    console.log('handleAnswer called with:', selectedOption);
    stop();
    if (answeredRef.current) return;
    answeredRef.current = true;
  
    setSelectedAnswer(selectedOption);
    setShowFeedback(true);
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    setTotalTime(prevTotal => prevTotal + timeTaken);
  
    const isCorrect = selectedOption === words[currentWordIndex];
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setCorrectWords(prev => [...prev, words[currentWordIndex]]);
    } else {
      setIncorrectAnswers(prev => [...prev, {
        word: words[currentWordIndex],
        userChoice: selectedOption,
        correctChoice: words[currentWordIndex],
      }]);
    }
  
    if (user) {
      let updatedUser = updateReviewSchedule(user, words[currentWordIndex], isCorrect);
      if (!isCorrect) {
        updatedUser = scheduleWordForReview(updatedUser, words[currentWordIndex]);
      }
      updateUserProgress(updatedUser);
    }
  
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prevIndex => prevIndex + 1);
      } else {
        setAssessmentComplete(true);
      }
    }, 500);
  }, [currentWordIndex, startTime, words, user, updateUserProgress, stop]);

  const handleSpeak = useCallback(() => {
    if (wordInfo) {
      speak(wordInfo.word);
    }
  }, [wordInfo, speak]);

  // Ensure correct update of uniqueWordsMastered and level progress
  const handleAssessmentComplete = useCallback(() => {
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
        onComplete({
          score,
          totalQuestions: words.length,
          incorrectAnswers,
          correctWords,
          averageTimePerWord: totalTime / words.length,
        });
      }
  
      updateUserProgress(updatedUserProgress);
    }
  }, [assessmentComplete, user, updateLevelProgress, updateUserProgress, words, correctWords, score, totalTime, assessmentType, levelId, sublevel, incorrectAnswers, onComplete]);

  useEffect(() => {
    console.log('AssessmentMode mounted, fetching words...');
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    console.log('Words updated:', words);
  }, [words]);

  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      stop();
      const currentWord = words[currentWordIndex];
      console.log('Fetching word data for:', currentWord);
      fetchWordData(currentWord).then(({ sentence, definition }) => {
        console.log('Word data fetched:', { sentence, definition });
        setExampleSentence(sentence);
        setDefinition(definition);
      });
  
      setStartTime(Date.now());
      answeredRef.current = false;
      if (autoSpeak) {
        speak(currentWord);
      }
    }
  }, [words, currentWordIndex, autoSpeak]);

  useEffect(() => {
    if (assessmentComplete && user && !navigationOccurredRef.current) {
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
    
      if (onComplete) {
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
      };
      router.push(`/performance-review?results=${encodeURIComponent(JSON.stringify(assessmentResults))}`);
    }
  }, [correctWords, incorrectAnswers, router, score, totalTime, words.length]);

  useEffect(() => {
    console.log('isLoading changed:', isLoading);
  }, [isLoading]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading assessment...</div>;
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
    );
  }

  if (words.length === 0) {
    return <div className="text-center mt-8">No words available for this level and type.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* <p className="mb-2">Question {currentWordIndex + 1} of {words.length}</p> */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-blue-500 h-4 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        {/* <h2 className="text-2xl font-bold">Assessment Mode</h2> */}
        <p className="mb-4">Score: {score}</p>
        <button
          onClick={toggleAutoSpeak}
          className="text-white hover:text-gray-300"
          aria-label={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
        >
          {autoSpeak ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
        </button>
      </div>
      {wordInfo && (
        <div className="mb-4 space-y-4">
          <div 
            className={`flex items-start cursor-pointer rounded p-1 transition-colors duration-200 ${
              speaking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
            }`}
            onClick={speaking ? undefined : handleSpeak}
          >
            <div className="w-10 flex-shrink-0 flex justify-center">
              <button
                disabled={speaking}
                className={`rounded-full transition-colors duration-200 ${
                  speaking ? 'text-gray-400' : 'text-white'
                }`}
                aria-label={speaking ? 'Speaking' : 'Speak Word'}
              >
                <FaVolumeUp size={24} />
              </button>
            </div>
            <span className="ml-2 text-md font-semibold">Speak</span>
          </div>
        
          <div 
            className="flex items-start cursor-pointer rounded p-1 transition-colors duration-200 hover:bg-gray-700"
            onClick={toggleCollapse}
          >
            <div className="w-10 flex-shrink-0 flex justify-center">
              <FaInfo size={24} className="text-white" />
            </div>
            <div className="ml-2 text-md font-semibold">
              <div className="flex items-center">
                <span>Define</span>
                <span className="ml-2">{isCollapsed ? ' ' : '▲'}</span>
              </div>
            </div>
          </div>
          {!isCollapsed && definition.length > 0 && (
            <div className="ml-12 mt-2">
              {Array.isArray(definition) ? (
                definition.map((d: string, index) => (
                  <p key={index} className="mb-1">{d}</p>
                ))
              ) : (
                <p>No definitions available</p>
              )}
            </div>
          )}
        
          <div 
            className="flex items-start cursor-pointer hover:bg-gray-700 rounded p-1 transition-colors duration-200"
            onClick={handleSpeakSentence}
            style={{ minHeight: '10em' }} // Add this line to set the minimum height
          >
            <div className="w-10 flex-shrink-0 flex justify-center">
              <FaVolumeUp 
                size={24} 
                className="text-white"
              />
            </div>
            <div className="ml-2 text-lg font-semibold">
              <p>{exampleSentence}</p>
            </div>
          </div>
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
  );
});

AssessmentMode.displayName = 'AssessmentMode';

export default AssessmentMode;