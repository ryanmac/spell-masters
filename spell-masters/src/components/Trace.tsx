// src/components/Trace.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Text, Line } from 'react-konva';
import Konva from 'konva';
import { useUser } from '@/contexts/UserContext';
import { useTTS } from '@/hooks/useTTS';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaVolumeUp } from 'react-icons/fa';

const BRUSH_SIZE = 12;
const BUFFER_SIZE = BRUSH_SIZE * 5; // Buffer size for checking white pixels

interface LineProps {
  tool: string;
  points: number[];
  color: string;
}

const Trace: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lines, setLines] = useState<LineProps[]>([]);
  const [wordPath, setWordPath] = useState<any>(null); // Use more specific type if available
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [initialWhitePixels, setInitialWhitePixels] = useState<number>(0);
  // const whitePixelMap = new Set<number>(); // Specify the set to hold numbers
  const [whitePixelMap, setWhitePixelMap] = useState<Set<string>>(new Set());
  const [bufferedWhitePixelMap, setBufferedWhitePixelMap] = useState<Set<string>>(new Set());
  const stageRef = useRef<Konva.Stage | null>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const [isTextReady, setIsTextReady] = useState(false);
  const searchParams = useSearchParams();
  const wordsParam = searchParams.get('words');
  const [words, setWords] = useState<string[]>([]);
  const { user, updateUserProgress } = useUser();
  const { speak } = useTTS();
  const router = useRouter();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [stageSize, setStageSize] = useState({ width: 400, height: 200 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wordsParam) {
      setWords(JSON.parse(decodeURIComponent(wordsParam)));
    } else if (user) {
      setWords(user.challengingWords);
    }
  }, [wordsParam, user]);

  useEffect(() => {
    if (words.length > 0) {
      setCurrentWord(words[currentWordIndex]);
    } else {
      setCurrentWord('');
    }
  }, [words, currentWordIndex]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
  
    window.addEventListener('resize', updateSize);
    updateSize();
  
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (textRef.current && stageRef.current) {
      const stage = stageRef.current;
      const text = textRef.current;
  
      // Use a temporary context to calculate text dimensions
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
  
      if (tempContext) {
        tempContext.font = '100px Arial'; // Ensure this matches the Konva Text properties
        tempContext.fillStyle = 'black';
        const textMetrics = tempContext.measureText(currentWord);
        const textWidth = textMetrics.width;
        const textHeight = 100; // Use the font size directly
  
        // Set the text position based on calculated dimensions
        // const xPos = (stage.width() - textWidth) / 2;
        // const yPos = (stage.height() - textHeight) / 2;
  
        // Apply calculated positions
        // text.x(xPos);
        // text.y(yPos);
  
        text.getLayer()?.batchDraw();
      }
  
      // Now the text is ready to be shown
      setIsTextReady(true);
      console.log('Text is ready');
  
      // Trigger preCheck after setting up text position and rendering
      console.log('Running preCheck');
      preCheck();
    }
  }, [currentWord]);

  const handleStart = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    setIsDrawing(true);
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      setLines([...lines, { tool: 'brush', points: [pos.x, pos.y], color: 'green' }]);
    }
  };
  
  const handleMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (point) {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines([...lines]);
    }
  };
  
  const handleEnd = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setLines([...lines, { tool: 'brush', points: [pos.x, pos.y], color: 'green' }]);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    if (stage) {
      const point = stage.getPointerPosition();
      if (point) {
        const lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        setLines(lines.concat());
      }
    }
  };

  const handleMouseUp = () => setIsDrawing(false);
  
  const handleReset = () => {
    setIsCorrect(false);
    setLines([]);
    setShowFeedback(false);
  };

  const preCheck = () => {
    const stage = stageRef.current;
    if (!stage) return;
  
    const dataURL = stage.toDataURL();
    const img = new Image();
    img.src = dataURL;
  
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      if (!context) {
        console.error("Failed to get 2D context");
        return;
      }
  
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
  
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
  
      let initialWhitePixels = 0;
      const whitePixelMap = new Set<string>();
      const bufferedWhitePixelMap = new Set<string>();
  
      // Calculate integer buffer size to ensure full coverage
      const bufferSize = Math.ceil(BUFFER_SIZE);
  
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
  
          const isWhite = r > 240 && g > 240 && b > 240;
          if (isWhite) {
            initialWhitePixels++;
            whitePixelMap.add(`${x},${y}`);
  
            // Expand buffer to cover all pixels within BUFFER_SIZE
            for (let by = -bufferSize; by <= bufferSize; by++) {
              for (let bx = -bufferSize; bx <= bufferSize; bx++) {
                const bufferX = x + bx;
                const bufferY = y + by;
                if (bufferX >= 0 && bufferX < canvas.width && bufferY >= 0 && bufferY < canvas.height) {
                  bufferedWhitePixelMap.add(`${bufferX},${bufferY}`);
                }
              }
            }
          }
        }
      }
  
      console.log(`preCheck Initial white pixels: ${initialWhitePixels}`);
      setInitialWhitePixels(initialWhitePixels);
      setWhitePixelMap(whitePixelMap);
      setBufferedWhitePixelMap(bufferedWhitePixelMap);
    };
  };

  const handleCheck = () => {
    const stage = stageRef.current;
    if (!stage) return;
  
    const dataURL = stage.toDataURL();
    const img = new Image();
    img.src = dataURL;
  
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      if (!context) {
        console.error("Failed to get 2D context");
        return;
      }
  
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
  
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
  
      let greenPixelsOverInitialWhite = 0;
      let totalGreenPixels = 0;
      let incorrectGreenPixels = 0;
  
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
  
          const isGreen = r === 0 && g > 100 && b === 0;
  
          if (isGreen) {
            totalGreenPixels++;
            if (bufferedWhitePixelMap.has(`${x},${y}`)) {
              greenPixelsOverInitialWhite++;
            } else {
              incorrectGreenPixels++;
            }
          }
        }
      }
  
      // Apply exponential growth for a higher penalty when there are many incorrect pixels
      const incorrectPixelRatio = incorrectGreenPixels / totalGreenPixels;
      const dynamicPenaltyFactor = Math.min(5, 1 + Math.pow(incorrectPixelRatio * 20, 2)); // Steeper exponential growth

      const penalty = (incorrectGreenPixels / initialWhitePixels) * 100;
      
      const coverage = Math.min((greenPixelsOverInitialWhite / initialWhitePixels) * 100, 100);
      const adjustedCoverage = Math.max(0, coverage - (dynamicPenaltyFactor * penalty));
      
      // Set the dynamic minimum incorrect pixel threshold based on a percentage of initial white pixels
      const minIncorrectPixelPercentage = 0.05; // Adjust to 10% or 20% based on testing
      const minimumIncorrectPixelThreshold = initialWhitePixels * minIncorrectPixelPercentage; 
      
      // const shouldPass = adjustedCoverage >= 50 && incorrectGreenPixels < minimumIncorrectPixelThreshold; // Adjusted pass condition
      // Introduce a minimum coverage threshold
      const MIN_COVERAGE = 40;

      // Modify the pass condition
      const shouldPass = adjustedCoverage >= MIN_COVERAGE && 
                        incorrectPixelRatio < 0.15 && 
                        coverage >= 80;

      console.log(`Brush Size: ${BRUSH_SIZE}`);
      console.log(`Buffer Size: ${BUFFER_SIZE}`);
      console.log(`Total White Pixels + Buffer: ${initialWhitePixels}`);
      console.log(`Total Green Pixels: ${totalGreenPixels}`);
      console.log(`Green Pixels Over Initial White + Buffer: ${greenPixelsOverInitialWhite}`);
      console.log(`Incorrect Green Pixels: ${incorrectGreenPixels}`);
      console.log(`Incorrect Pixel Ratio: ${incorrectPixelRatio}`);
      console.log(`Coverage: ${coverage.toFixed(2)}%`);
      console.log(`Dynamic Penalty Factor: ${dynamicPenaltyFactor}`);
      console.log(`Penalty: ${penalty.toFixed(2)}%`);
      console.log(`Adjusted Coverage: ${adjustedCoverage.toFixed(2)}%`);
      console.log(`Minimum Incorrect Pixel Threshold: ${minimumIncorrectPixelThreshold}`);
      console.log(`Should Pass: ${shouldPass}`);

      if (shouldPass) {
        setFeedbackMessage('Correct! Well done!');
        setIsCorrect(true);
        if (currentWordIndex < words.length - 1) {
          setTimeout(() => {
            setCurrentWordIndex((prevIndex) => prevIndex + 1);
            setShowFeedback(false);
            handleReset();
          }, 1000);
        } else {
          setTimeout(() => {
            console.log('All words completed!');
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        if (adjustedCoverage < MIN_COVERAGE) {
          setFeedbackMessage('Not enough coverage! Try again!');
          console.log(`${adjustedCoverage} < ${MIN_COVERAGE}`);
        }
        else if (incorrectPixelRatio >= 0.15) {
          setFeedbackMessage('Too many incorrect pixels! Try again!');
          console.log(`${incorrectPixelRatio} >= 0.15`);
        }
        else if (coverage < 80) {
          setFeedbackMessage('Too messy! Try again!');
          console.log(`${coverage} < 80`);
        }
        setIsCorrect(false);
        setTimeout(() => {
          handleReset();
          setShowFeedback(false);
        }, 2000);
      }
      setShowFeedback(true);
    };
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Trace</h2>
      <p className="mb-2">Trace the word: {currentWord}</p>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => speak(words[currentWordIndex])}
          className="px-4 py-2 text-white rounded hover:text-blue-500"
        >
          <FaVolumeUp size={24} />
        </button>
      </div>
      <Stage
        width={400}
        height={200}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ touchAction: 'none' }}
        // style={{ border: '2px solid white' }}
      >
        <Layer>
          <Text
            ref={textRef}
            text={currentWord}
            fontSize={100}
            fontFamily="Arial"
            letterSpacing={10}
            fill="white"
            x={10}
            y={10}
            // offsetX={textRef.current ? textRef.current.width() / 2 : 0}
            // offsetY={textRef.current ? textRef.current.height() / 2 : 0}
          />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={BRUSH_SIZE}
              tension={0.5}
              lineCap="round"
            />
          ))}
        </Layer>
      </Stage>
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
      {showFeedback && (
        <p className={`mt-4 font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {feedbackMessage}
        </p>
      )}
    </div>
  );
};

export default Trace;