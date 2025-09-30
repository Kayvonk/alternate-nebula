import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

function App() {
  const width = 800;
  const height = 200;
  const baseAmplitude = 30;
  const thickness = 60;
  const wavelength = 200;
  const points = 160;
  
  // Animation Control Constants
  const maxAmplitudeOffset = 10;
  const speed = 0.3; 

  // State is ONLY used for rendering
  const [amplitudeOffset, setAmplitudeOffset] = useState(0);
  // xOffset is no longer needed since we're removing the second layer that used it
  // const [xOffset, setXOffset] = useState(0); 

  // REFS: Used to track animation values without triggering component re-renders
  const amplitudeRef = useRef(0);
  const isIncreasingRef = useRef(true);

  // Animation Loop (Fixed for smooth, continuous cycle)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const step = deltaTime * 0.001 * speed * 20;

      // --- Amplitude Pulsation Logic (Using Refs for smoothness) ---
      let currentAmp = amplitudeRef.current;
      let isIncreasing = isIncreasingRef.current;

      if (isIncreasing) {
        currentAmp += step;
        if (currentAmp >= maxAmplitudeOffset) {
          currentAmp = maxAmplitudeOffset;
          isIncreasingRef.current = false; 
        }
      } else {
        currentAmp -= step;
        if (currentAmp <= -maxAmplitudeOffset) {
          currentAmp = -maxAmplitudeOffset;
          isIncreasingRef.current = true; 
        }
      }
      amplitudeRef.current = currentAmp;

      // Update state for rendering
      setAmplitudeOffset(currentAmp);

      // xOffset animation is removed as there's no second layer
      // setXOffset(prev => (prev - 0.5) % width);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [maxAmplitudeOffset, speed, width]);

  // Helper function to generate the SVG path data
  // Simplified since there's only one path now, no horizontalShift needed
  const generatePath = useCallback((ampBase, ampOffset, thick, waveLen) => {
    let path = `M0 ${height / 2} `;
    
    // Top edge of the wave
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (ampBase + ampOffset) * Math.sin((2 * Math.PI * x) / waveLen); // Removed horizontalShift
      path += `L${x} ${y} `;
    }
    
    // Bottom edge of the wave (reverse order)
    for (let i = points; i >= 0; i--) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (ampBase + ampOffset) * Math.sin((2 * Math.PI * x) / waveLen) + // Removed horizontalShift
        thick;
      path += `L${x} ${y} `;
    }
    path += "Z";
    return path;
  }, [height, width, points]);


  // Only one path now: The primary deep purple nebula
  const nebulaPath = generatePath(
    baseAmplitude, 
    amplitudeOffset, 
    thickness, 
    wavelength
  );


  return (
    <div className="App">
      {/* Star Field background removed */}
      
      <svg
        className="nebula"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Main Deep Purple Gradient */}
          <linearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(30,0,60,0)" />    {/* Darker, almost black purple start */}
            <stop offset="20%" stopColor="rgba(100,0,180,0.5)" /> {/* Deep purple with some opacity */}
            <stop offset="50%" stopColor="rgba(180,50,255,0.7)" /> {/* Brighter, rich purple core */}
            <stop offset="80%" stopColor="rgba(80,0,150,0.5)" />  {/* Deep purple again */}
            <stop offset="100%" stopColor="rgba(30,0,60,0)" />   {/* Darker end */}
          </linearGradient>
        </defs>

        {/* Render the single nebula path */}
        <path fill="url(#nebulaGradient)" d={nebulaPath} />

      </svg>
    </div>
  );
}

export default App;