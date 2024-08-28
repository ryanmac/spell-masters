// src/hooks/useTTS.ts
import { useState, useEffect } from 'react'

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

  const speak = (text: string, voice?: SpeechSynthesisVoice) => {
    if (!window.speechSynthesis) {
      console.error('Text-to-speech not supported in this browser.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }

  return { speak, stop, voices, speaking }
}