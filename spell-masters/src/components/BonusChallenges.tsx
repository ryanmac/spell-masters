// src/components/BonusChallenges.tsx
import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useWord } from '@/hooks/useWord'
import { useMisspelling } from '@/hooks/useMisspelling'
import { useTTS } from '@/hooks/useTTS'

const BonusChallenges: React.FC = () => {
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const { user, updateUserProgress } = useUser()
  const { wordInfo } = useWord(words[currentWordIndex] || '')
  const { generateMisspellings } = useMisspelling()
  const { speak } = useTTS()

  useEffect(() => {
    const fetchBonusWords = async () => {
      const response = await fetch(`/api/words?level=${user?.grade}&type=bonus`)
      const data = await response.json()
      setWords(data.words)
    }
    if (user) {
      fetchBonusWords()
    }
  }, [user])

  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      const misspellings = generateMisspellings(words[currentWordIndex], 3)
      setOptions([words[currentWordIndex], ...misspellings].sort(() => Math.random() - 0.5))
    }
  }, [words, currentWordIndex, generateMisspellings])

  const handleAnswer = (selectedOption: string) => {
    if (selectedOption === words[currentWordIndex]) {
      setScore(score + 1)
      updateUserProgress({
        uniqueWordsMastered: (user?.uniqueWordsMastered || 0) + 1,
        totalStars: (user?.totalStars || 0) + 1
      })
    }
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      // End of bonus challenge
      alert(`Bonus Challenge complete! Your score: ${score + 1}/${words.length}`)
      // Reset for next round or navigate to dashboard
    }
  }

  const handleSpeak = () => {
    if (wordInfo) {
      speak(wordInfo.word)
    }
  }

  if (words.length === 0) {
    return <div>Loading bonus words...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Bonus Challenges</h2>
      <p className="mb-2">Score: {score}/{currentWordIndex + 1}</p>
      {wordInfo && (
        <div className="mb-4">
          <p className="text-lg font-semibold">{wordInfo.meanings[0].example.replace(wordInfo.word, '_____')}</p>
          <button onClick={handleSpeak} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Speak Word
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="p-2 bg-purple-200 rounded hover:bg-purple-300"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default BonusChallenges