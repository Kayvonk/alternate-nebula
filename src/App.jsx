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
  const [xOffset, setXOffset] = useState(0); 

  // REFS: Used to track animation values without triggering component re-renders
  const amplitudeRef = useRef(0);
  const isIncreasingRef = useRef(true);

  // Animation Loop (FIXED for smooth, continuous cycle)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Calculate the step (Frame-rate independent movement)
      const step = deltaTime * 0.001 * speed * 20;

      // --- Amplitude Pulsation Logic (Using Refs for smoothness) ---
      let currentAmp = amplitudeRef.current;
      let isIncreasing = isIncreasingRef.current;

      if (isIncreasing) {
        currentAmp += step;
        if (currentAmp >= maxAmplitudeOffset) {
          currentAmp = maxAmplitudeOffset;
          isIncreasingRef.current = false; // Flip direction
        }
      } else {
        currentAmp -= step;
        if (currentAmp <= -maxAmplitudeOffset) {
          currentAmp = -maxAmplitudeOffset;
          isIncreasingRef.current = true; // Flip direction
        }
      }
      amplitudeRef.current = currentAmp;

      // Update state for rendering
      setAmplitudeOffset(currentAmp);

      // Horizontal panning for the background layer
      setXOffset(prev => (prev - 0.5) % width);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup function to stop the animation
    return () => cancelAnimationFrame(animationFrameId);
  }, [maxAmplitudeOffset, speed, width]);

  // Helper function to generate the SVG path data
  const generatePath = useCallback((ampBase, ampOffset, thick, waveLen, horizontalShift) => {
    let path = `M0 ${height / 2} `;
    
    // Top edge of the wave
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (ampBase + ampOffset) * Math.sin((2 * Math.PI * (x + horizontalShift)) / waveLen);
      path += `L${x} ${y} `;
    }
    
    // Bottom edge of the wave (reverse order)
    for (let i = points; i >= 0; i--) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (ampBase + ampOffset) * Math.sin((2 * Math.PI * (x + horizontalShift)) / waveLen) +
        thick;
      path += `L${x} ${y} `;
    }
    path += "Z";
    return path;
  }, [height, width, points]);


  // Path 1: Foreground layer (Pulsating)
  const path1 = generatePath(
    baseAmplitude, 
    amplitudeOffset, 
    thickness, 
    wavelength, 
    0
  );

  // Path 2: Background layer (Wider, Smoother, and Moving)
  const path2 = generatePath(
    baseAmplitude * 1.5,     
    amplitudeOffset * 0.5,   
    thickness * 0.8,         
    wavelength * 1.5,        
    xOffset                 
  );


  return (
    <div className="App">
      {/* 1. Star Field Background */}
      <div className="star-field" /> 
      
      {/* 2. Layered Nebula SVG */}
      <svg
        className="nebula"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient 1: Front Layer (Purple/Pink) */}
          <linearGradient id="nebulaGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(128,0,255,0)" />
            <stop offset="25%" stopColor="rgba(120,80,255,0.4)" />
            <stop offset="50%" stopColor="rgba(200,150,255,0.6)" />
            <stop offset="75%" stopColor="rgba(80,120,255,0.4)" />
            <stop offset="100%" stopColor="rgba(128,0,255,0)" />
          </linearGradient>

          {/* Gradient 2: Back Layer (Cyan/Green) */}
          <linearGradient id="nebulaGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,100,100,0)" />
            <stop offset="30%" stopColor="rgba(0,255,200,0.2)" />
            <stop offset="70%" stopColor="rgba(100,255,0,0.2)" />
            <stop offset="100%" stopColor="rgba(0,100,100,0)" />
          </linearGradient>
        </defs>

        {/* Path 2: Background Layer */}
        <path fill="url(#nebulaGradient2)" d={path2} />
        
        {/* Path 1: Foreground Layer */}
        <path fill="url(#nebulaGradient1)" d={path1} />

      </svg>
    </div>
  );
}

export default App;