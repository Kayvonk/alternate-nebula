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
  const height = 600; // ⭐️ INCREASED: Taller SVG height for more canvas space
  const baseAmplitude = 30;
  const amplitudeVariation = 0.6;
  const thickness = 15; 
  const baseWavelength = 200;
  const points = 800; 
  const segments = 5;
  const amplitudeAnimationFactor = 20;

  const glowHeight = 350; // ⭐️ INCREASED: Pushes the glow's top edge much higher
  const secondWidth = width * 0.5; 
  const rotationAngle = 10; 
  const rotationCenter = `${width / 2} ${height / 2}`; 
  const glowGradientID = "glowGradient"; 
  const centerLineY = height / 2; // New center is 300

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
  const getBaseY = (x, pathWidth, isBottom, isGlowTop) => { 
    const normalizedX = x / pathWidth; 
    const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
    const t = (normalizedX * segments) - Math.floor(normalizedX * segments);
    
    const nextIndex = Math.min(segmentIndex + 1, segments);
      
    const baseAmpModifier = 
      baseAmplitudeControls.current[segmentIndex] * (1 - t) + 
      baseAmplitudeControls.current[nextIndex] * t;
      
    const oscillation = Math.sin((2 * Math.PI * x) / (baseWavelength * 2) + phase) * amplitudeAnimationFactor;
    
    const currentAmplitude = baseAmplitude * baseAmpModifier + oscillation;

    let y = centerLineY + currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength); 
    
    if (isBottom) {
        y += thickness;
    }
    
    if (isGlowTop) {
        y -= glowHeight; 
    }

    return y;
  }

  // 4. Path Generation Function
  const generatePath = (pathWidth, includeGlowTop) => {
      const pathPoints = [];
      
      // Top wave of the DARK CLOUD / Bottom wave of the GLOW (Left-to-Right)
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * pathWidth; 
        const y = getBaseY(x, pathWidth, false, false);
        pathPoints.push({x, y});
      }

      let path = `M${pathPoints[0].x} ${pathPoints[0].y} `;
      for (let i = 1; i < pathPoints.length; i++) {
          path += `L${pathPoints[i].x} ${pathPoints[i].y} `;
      }
      
      if (includeGlowTop) {
          // If generating the glow path, close the shape by going to the top of the SVG
          path += `L${pathPoints[pathPoints.length - 1].x} 0 L0 0 Z`;
      } else {
          // If generating the dark cloud, trace the bottom wave and close
          for (let i = points; i >= 0; i--) {
            const x = (i / points) * pathWidth; 
            const y = getBaseY(x, pathWidth, true, false);
            path += `L${x} ${y} `;
          }
          path += "Z";
      }

      return path;
  }

  const mainDarkPath = generatePath(width, false);
  const mainGlowPath = generatePath(width, true); // New path that follows the top line and closes at the SVG top

  const secondDarkPath = generatePath(secondWidth, false);

  const silhouetteColor = "#200020"; // Very dark, deep purple-black

  return (
    <div className="App">
      <svg
        className="nebula"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* 5. Define the Vertical Glow Gradient */}
        <defs>
          <linearGradient id={glowGradientID} x1="0%" y1="100%" x2="0%" y2="0%">
            {/* Color starts exactly at the wavy line (100% Y) */}
            <stop offset="0%" style={{stopColor: "rgb(255, 100, 100)", stopOpacity: 0.9}} />
            {/* Fades to black/transparent at the top of the SVG (0% Y) */}
            <stop offset="100%" style={{stopColor: "rgb(0, 0, 0)", stopOpacity: 0.0}} />
          </linearGradient>
        </defs>

        {/* 6. GLOW PATH: Sits behind the dark cloud, starts at the wave, fades up */}
        <path fill={`url(#${glowGradientID})`} d={mainGlowPath} />

        {/* 7. Animated Dark Nebula Shapes (Sits on top of the glow) */}
        {/* MAIN (FULL WIDTH) SHAPE */}
        <path fill={silhouetteColor} d={mainDarkPath} />
        
        {/* SECOND (50% WIDTH) SHAPE */}
        <path 
          fill={silhouetteColor} 
          d={secondDarkPath} 
          transform={`translate(${width / 2 - secondWidth / 2}, 0) rotate(${rotationAngle}, ${rotationCenter})`} 
        />
      </svg>
    </div>
  );
}

export default App;