import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  // 1. Animation State Setup
  const [phase, setPhase] = useState(0); 
  const animationRef = useRef();
  
  // --- Animation Loop Setup ---
  const animate = () => {
    setPhase(prevPhase => (prevPhase + 0.005) % (2 * Math.PI));
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // --- Static Constants ---
  const width = 800;
  const height = 300; // ⭐️ INCREASED: Taller SVG height to prevent clipping
  const baseAmplitude = 30;
  const amplitudeVariation = 0.6;
  const thickness = 60;
  const baseWavelength = 200;
  const points = 800; 
  const segments = 5;
  const amplitudeAnimationFactor = 20;

  // Helper function for generating a random value around zero
  const getRandomOffset = (factor) => (Math.random() - 0.5) * 2 * factor;

  // 2. Store the base amplitude control points permanently using useRef
  const baseAmplitudeControls = useRef([]);

  if (baseAmplitudeControls.current.length === 0) {
    for (let i = 0; i < segments + 1; i++) {
      baseAmplitudeControls.current.push(1 + getRandomOffset(amplitudeVariation));
    }
  }

  // 3. Function to calculate the base Y position (incorporating fluid motion)
  const getBaseY = (x, isBottom) => {
    const normalizedX = x / width;
    const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
    const t = (normalizedX * segments) - Math.floor(normalizedX * segments);
    
    const nextIndex = Math.min(segmentIndex + 1, segments);
      
    const baseAmpModifier = 
      baseAmplitudeControls.current[segmentIndex] * (1 - t) + 
      baseAmplitudeControls.current[nextIndex] * t;
      
    const oscillation = Math.sin((2 * Math.PI * x) / (baseWavelength * 2) + phase) * amplitudeAnimationFactor;
    
    const currentAmplitude = baseAmplitude * baseAmpModifier + oscillation;

    // ⭐️ CENTERED WAVE: Use height / 2 with the new, larger height (300)
    let y = height / 2 + currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength); 
    
    if (isBottom) {
        y += thickness;
    }

    return y;
  }

  // 4. Generate the path
  let path = `M0 ${getBaseY(0, false)} `;
  
  for (let i = 1; i <= points; i++) {
    const x = (i / points) * width;
    const y = getBaseY(x, false);
    path += `L${x} ${y} `;
  }

  for (let i = points; i >= 0; i--) {
    const x = (i / points) * width;
    const y = getBaseY(x, true);
    path += `L${x} ${y} `;
  }

  path += "Z";

  return (
    <div className="App">
      <svg
        className="nebula"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <path fill="white" d={path} />
      </svg>
    </div>
  );
}

export default App;