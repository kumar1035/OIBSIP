import { useState, useEffect, useCallback } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])

  useEffect(() => {
    const load = () => {
      const available = window.speechSynthesis.getVoices()
      if (available.length > 0) setVoices(available)
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => window.speechSynthesis.cancel()
  }, [])

  const speak = useCallback((text) => {
    if (!text) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const preferred =
      voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices[0]
    if (preferred) utterance.voice = preferred
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [voices])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, speak, stopSpeaking }
}
