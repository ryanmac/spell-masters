// src/components/TargetedReinforcement.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useWord } from '@/hooks/useWord'
import { useTTS } from '@/hooks/useTTS'
import { useMisspelling } from '@/hooks/useMisspelling'
import { useRouter } from 'next/navigation'
import { FaVolumeUp } from 'react-icons/fa'

const TargetedReinforcement: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [incorrectWords, setIncorrectWords] = useState<string[]>([])
  const { user, updateUserProgress } = useUser()
  const { wordInfo } = useWord(user?.challengingWords[currentWordIndex] || '')
  const { speak, speaking } = useTTS();
  const { generateMisspellings } = useMisspelling()
  const router = useRouter()

  useEffect(() => {
    if (user && user.challengingWords.length > 0) {
      const currentWord = user.challengingWords[currentWordIndex]
      const misspellings = generateMisspellings(currentWord, 3)
      setOptions([currentWord, ...misspellings].sort(() => Math.random() - 0.5))
    }
  }, [user, currentWordIndex, generateMisspellings])

  const handleAnswer = (selectedOption: string) => {
    setSelectedAnswer(selectedOption)
    setShowFeedback(true)
    const currentWord = user?.challengingWords[currentWordIndex] || ''

    let newIncorrectWords = [...incorrectWords];
    if (selectedOption !== currentWord) {
      newIncorrectWords.push(currentWord);
      setIncorrectWords(newIncorrectWords);
    }

    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      
      if (user && currentWordIndex < user.challengingWords.length - 1) {
        setCurrentWordIndex(prevIndex => prevIndex + 1)
      } else {
        // End of targeted reinforcement
        if (newIncorrectWords.length > 0) {
          router.push(`/kinesthetic-practice?words=${encodeURIComponent(JSON.stringify(newIncorrectWords))}`)
        } else {
          router.push('/dashboard')
        }
      }
    }, 200)
  }

  const handleSpeak = () => {
    if (wordInfo) {
      speak(wordInfo.word);
    }
  };

  if (!user || user.challengingWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Targeted Reinforcement</h2>
        <p className="mb-4">Congratulations! You have no challenging words to practice.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Targeted Reinforcement</h2>
      <p className="mb-2">Word {currentWordIndex + 1} of {user.challengingWords.length}</p>
      <p className="mb-4">Score: {score}</p>
      {wordInfo && (
        <div className="mb-4">
          <p className="text-lg font-semibold">{wordInfo.meanings[0].example.replace(wordInfo.word, '_____')}</p>
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
          <p className="mb-2">Definition: {wordInfo.meanings[0].definition.replace(wordInfo.word, '_____')}</p>
          <p className="mb-4">Example: {wordInfo.meanings[0].example.replace(wordInfo.word, '_____')}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`p-6 text-lg font-semibold rounded-lg text-center ${
              showFeedback
                ? option === user?.challengingWords[currentWordIndex]
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
          <p className={selectedAnswer === user?.challengingWords[currentWordIndex] ? "text-green-500" : "text-red-500"}>
            {selectedAnswer === user?.challengingWords[currentWordIndex] ? "Correct!" : `Incorrect. The correct answer is: ${user?.challengingWords[currentWordIndex]}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default TargetedReinforcement