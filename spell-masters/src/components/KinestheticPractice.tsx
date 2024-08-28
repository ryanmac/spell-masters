// src/components/KinestheticPractice.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useTTS } from '@/hooks/useTTS'
import { useRouter, useSearchParams } from 'next/navigation'

const BRUSH_SIZE = 8;
const BUFFER_SIZE = Math.floor(BRUSH_SIZE / 2);

const KinestheticPractice: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [offscreenCanvas, setOffscreenCanvas] = useState<HTMLCanvasElement | null>(null)
  const [bufferedWhitePixels, setBufferedWhitePixels] = useState<boolean[]>([]);
  const [totalWhitePixels, setTotalWhitePixels] = useState(0)
  const [whitePixels, setWhitePixels] = useState<boolean[]>([]);
  const [wordPath, setWordPath] = useState<Path2D | null>(null) // To store the path of the word text
  const [traceFailTimeout, setTraceFailTimeout] = useState<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const searchParams = useSearchParams()
  const wordsParam = searchParams.get('words')
  const [words, setWords] = useState<string[]>([])

  const { user, updateUserProgress } = useUser()
  const { speak } = useTTS()
  const router = useRouter()
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (wordsParam) {
      setWords(JSON.parse(decodeURIComponent(wordsParam)))
    } else if (user) {
      setWords(user.challengingWords)
    }
  }, [wordsParam, user])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    const renderText = () => {
      if (canvas && ctx && words.length > 0) {
        // Create an offscreen canvas
        const offCanvas = document.createElement('canvas');
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        const offCtx = offCanvas.getContext('2d');
  
        if (offCtx) {
          // Set background to black
          offCtx.fillStyle = 'black';
          offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
  
          // Set font properties
          offCtx.font = '64px Farsan';
          offCtx.fillStyle = 'white';
          offCtx.textAlign = 'center';
          offCtx.textBaseline = 'middle';
          offCtx.letterSpacing = '6px';
  
          // Calculate the center position
          const x = offCanvas.width / 2;
          const y = offCanvas.height / 2;
  
          // Render the text
          offCtx.fillText(words[currentWordIndex], x, y);
  
          // Create buffered white pixels
          ctx.getContextAttributes().willReadFrequently = true;
          const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
          const buffered = new Array(offCanvas.width * offCanvas.height).fill(false);
          const whitePixelsArray = new Array(offCanvas.width * offCanvas.height).fill(false);
          let whitePixelCount = 0;
          for (let y = 0; y < offCanvas.height; y++) {
            for (let x = 0; x < offCanvas.width; x++) {
              const i = (y * offCanvas.width + x) * 4;
              if (imageData.data[i] === 255) {
                whitePixelsArray[y * offCanvas.width + x] = true;
                whitePixelCount++;
                // Create buffer (keep this part for guiding the tracing)
                for (let by = Math.max(0, y - BUFFER_SIZE); by < Math.min(offCanvas.height, y + BUFFER_SIZE + 1); by++) {
                  for (let bx = Math.max(0, x - BUFFER_SIZE); bx < Math.min(offCanvas.width, x + BUFFER_SIZE + 1); bx++) {
                    buffered[by * offCanvas.width + bx] = true;
                  }
                }
              }
            }
          }
          setWhitePixels(whitePixelsArray);
          setBufferedWhitePixels(buffered);
          setTotalWhitePixels(whitePixelCount);
  
          // Save the offscreen canvas
          setOffscreenCanvas(offCanvas);
  
          // Render the offscreen canvas to the main canvas
          ctx.drawImage(offCanvas, 0, 0);
  
          // Debug: Visualize buffered area
          if (debug) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            for (let y = 0; y < offCanvas.height; y++) {
              for (let x = 0; x < offCanvas.width; x++) {
                if (buffered[y * offCanvas.width + x]) {
                  ctx.fillRect(x, y, 1, 1);
                }
              }
            }
          }
        }
      }
    };
  
    if (document.fonts.check('64px Farsan')) {
      renderText()
    } else {
      document.fonts.load('64px Farsan').then(renderText)
    }
  }, [currentWordIndex, debug, words])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Clear any pending fade-out if the user starts tracing again
    if (traceFailTimeout) {
      clearTimeout(traceFailTimeout)
      setTraceFailTimeout(null)
      handleReset()
    }

    setIsDrawing(true)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const handleMouseUp = () => setIsDrawing(false)

  const handleDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !offscreenCanvas) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
  
      const isBufferedWhite = bufferedWhitePixels[y * canvas.width + x];
  
      ctx.lineWidth = BRUSH_SIZE;
      ctx.lineCap = 'round';
      ctx.strokeStyle = isBufferedWhite ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
      ctx.lineTo(x, y);
      ctx.stroke();
  
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [isDrawing, offscreenCanvas, bufferedWhitePixels]);

  const handleReset = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx && offscreenCanvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(offscreenCanvas, 0, 0)
    }
    setIsCorrect(false)
  }

  useEffect(() => {
    if (words.length > 0) {
      setCurrentWord(words[0])
    } else {
      setCurrentWord('done')
    }
  }, [words])

  const handleCheck = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && offscreenCanvas) {
      ctx.getContextAttributes().willReadFrequently = true;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let greenPixelsOnWhite = 0;
      let missedPixels = 0;
  
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const isWhite = whitePixels[y * canvas.width + x];
        const isGreen = data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0 && data[i + 3] > 0;
  
        if (isWhite) {
          if (isGreen) {
            greenPixelsOnWhite++;
          } else {
            missedPixels++;
          }
        }
      }
  
      const coverage = (greenPixelsOnWhite / totalWhitePixels) * 100;
      console.log(`Coverage: ${coverage.toFixed(2)}%`);
      console.log(`Total white pixels: ${totalWhitePixels}`);
      console.log(`Green pixels on white: ${greenPixelsOnWhite}`);
      console.log(`Missed pixels: ${missedPixels}`);
  
      if (coverage >= 40) {  // Threshold at 40%
        setIsCorrect(true);
        if (currentWordIndex < words.length - 1) {
          setTimeout(() => {
            setCurrentWordIndex(prevIndex => prevIndex + 1);
            handleReset();
          }, 1000);
        } else {
          // All words completed
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      } else {
        setIsCorrect(false);
        // Visualize missed areas
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          if (whitePixels[y * canvas.width + x] && !(data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0 && data[i + 3] > 0)) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        setTraceFailTimeout(
          setTimeout(() => {
            handleReset();
          }, 2000)
        );
      }
    }
  };

  const handleSpeak = () => {
    speak(words[currentWordIndex])
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  if (words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Kinesthetic Practice</h2>
        <p className="mb-4">Congratulations! You&apos;ve practiced all your challenging words.</p>
        <button onClick={handleFinish} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Kinesthetic Practice</h2>
      <p className="mb-2">Trace the word: {words[currentWordIndex]}</p>
      <div className="flex justify-between items-center mb-2">
        <button onClick={handleSpeak} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Speak Word
        </button>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={debug} 
            onChange={(e) => {
              setDebug(e.target.checked);
              handleReset(); // Reset and redraw when toggling debug mode
            }} 
            className="mr-2" 
          />
          Debug Mode
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="border border-gray-300 mb-4"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleDrawing}
      ></canvas>
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset
        </button>
        <button
          onClick={handleCheck}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check
        </button>
      </div>
      {isCorrect && (
        <p className="mt-4 text-green-500 font-bold">Correct! Well done!</p>
      )}
    </div>
  )
}

export default KinestheticPractice