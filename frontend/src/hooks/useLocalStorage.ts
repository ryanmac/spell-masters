// src/hooks/useLocalStorage.ts
import { useState, useEffect, useRef } from 'react'
import localforage from 'localforage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const initialValueRef = useRef(initialValue)

  useEffect(() => {
    const getItem = async () => {
      try {
        const value = await localforage.getItem<T>(key)
        setStoredValue(value ?? initialValueRef.current)
      } catch (error) {
        console.error(error)
        setStoredValue(initialValueRef.current)
      }
    }
    getItem()
  }, [key])

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      await localforage.setItem(key, valueToStore)
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}