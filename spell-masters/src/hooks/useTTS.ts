// src/hooks/useTTS.ts
import { useState, useEffect, useCallback } from 'react'

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices())
    }

    updateVoices()

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [])

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [])

  const speak = useCallback((text: string, voice?: SpeechSynthesisVoice) => {
    if (!window.speechSynthesis) {
      console.error('Text-to-speech not supported in this browser.')
      return
    }

    stop() // Stop any ongoing speech before starting a new one

    const utterance = new SpeechSynthesisUtterance(text)
    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [stop])

  const speakSentence = useCallback((sentence: string, word: string) => {
    const fullSentence = sentence.replace(/_____/g, word)
    speak(fullSentence)
  }, [speak])

  return { speak, speakSentence, stop, voices, speaking }
}