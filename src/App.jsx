import React from "react";
import "./App.css";

function App() {
  const width = 800;
  const height = 200;
  const baseAmplitude = 30; // Base height of the wave
  const amplitudeVariation = 0.6; // Max random multiplier for amplitude
  const thickness = 60; // vertical thickness of nebula
  const baseWavelength = 200; // distance between peaks
  const points = 800; // Increased for a smooth line

  // Helper function for generating a random value around zero
  const getRandomOffset = (factor) => (Math.random() - 0.5) * 2 * factor;

  // 1. Pre-calculate slowly changing amplitude modifiers
  const amplitudeModifiers = [];
  const segments = 5;
  for (let i = 0; i < segments + 1; i++) {
    amplitudeModifiers.push(1 + getRandomOffset(amplitudeVariation));
  }

  // 2. Function to calculate the base Y position based on X and shared modifiers
  const getBaseY = (x, isBottom) => {
    // ⭐️ Safely determine the segment index and interpolation factor (t)
    // Clamp the value to ensure index is never out of bounds
    const normalizedX = x / width;
    const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
    const t = (normalizedX * segments) - Math.floor(normalizedX * segments);
    
    // Determine the index of the next modifier (safely clamped)
    const nextIndex = Math.min(segmentIndex + 1, segments);
      
    // Linearly interpolate the amplitude modifier
    const currentAmpModifier = 
      amplitudeModifiers[segmentIndex] * (1 - t) + 
      amplitudeModifiers[nextIndex] * t;
      
    const currentAmplitude = baseAmplitude * currentAmpModifier;

    // Calculate the base sine wave position
    let y = height / 2 + currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength);
    
    // Apply vertical offset if it's the bottom path
    if (isBottom) {
        y += thickness;
    }

    return y;
  }

  // 3. Generate the path
  let path = `M0 ${getBaseY(0, false)} `;
  
  // Generate top wave (Left-to-Right)
  for (let i = 1; i <= points; i++) {
    const x = (i / points) * width;
    const y = getBaseY(x, false);
    path += `L${x} ${y} `;
  }

  // Generate bottom wave (Right-to-Left)
  for (let i = points; i >= 0; i--) {
    const x = (i / points) * width;
    const y = getBaseY(x, true);
    path += `L${x} ${y} `;
  }

  path += "Z"; // Close the path

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