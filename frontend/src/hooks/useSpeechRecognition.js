import { useState, useEffect, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)
  const onFinalRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(text)
      if (event.results[event.results.length - 1].isFinal) {
        onFinalRef.current?.(text)
      }
    }

    recognition.onend = () => setIsListening(false)

    recognition.onerror = (e) => {
      if (e.error !== 'aborted') setError(e.error)
      setIsListening(false)
    }

    recognitionRef.current = recognition
    return () => recognition.abort()
  }, [])

  const startListening = useCallback((onFinal) => {
    if (!recognitionRef.current || isListening) return
    onFinalRef.current = onFinal
    setTranscript('')
    setError(null)
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      // already started
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, transcript, error, supported, startListening, stopListening }
}
