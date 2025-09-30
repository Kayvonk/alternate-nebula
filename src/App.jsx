import React, { useState, useEffect } from "react";
import Stars from "./Stars";
import Nebula from "./Nebula";

const App = () => {
  const [phase, setPhase] = useState(0);

  // Animate phase (for twinkling stars + animated nebula)
  useEffect(() => {
    let frameId;
    const animate = (time) => {
      setPhase(time / 1000); // use seconds
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        {/* Shared noise filter for glow/distortion */}
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
        </filter>

        {/* Gradient for nebula */}
        <linearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a0ca3" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#7209b7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4361ee" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="black" />

      {/* Nebula behind stars */}
      <Nebula width={width} height={height} filterId="noiseFilter" phase={phase} />

      {/* Stars over nebula */}
      <Stars
        width={width}
        height={height}
        starCount={50}
        filterId="noiseFilter"
        phase={phase}
      />
    </svg>
  );
};

export default App;
