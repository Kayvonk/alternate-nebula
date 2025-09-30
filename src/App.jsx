import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// Define color palettes with enhanced brightness for better radiation
const colorPalettes = [
  // 0: Deep Rich Purple (Enhanced center glow)
  [
    { offset: "0%", color: "rgba(255,150,255,0.8)" }, // Brighter, near-white core
    { offset: "20%", color: "rgba(160,50,255,0.6)" }, // Saturated purple mid-glow
    { offset: "80%", color: "rgba(30,0,60,0)" },   // Outer fade
  ],
  // 1: Deep Blue (Fine-tuned)
  [
    { offset: "0%", color: "rgba(150,200,255,0.8)" },
    { offset: "20%", color: "rgba(50,100,200,0.6)" },
    { offset: "80%", color: "rgba(0,10,60,0)" },
  ],
  // 2: Deep Green (Fine-tuned)
  [
    { offset: "0%", color: "rgba(200,255,150,0.8)" },
    { offset: "20%", color: "rgba(100,200,50,0.6)" },
    { offset: "80%", color: "rgba(10,60,0,0)" },
  ],
  // 3: Deep Red (Enhanced center glow)
  [
    { offset: "0%", color: "rgba(255,180,180,0.8)" }, // Brighter, pinkish core
    { offset: "20%", color: "rgba(200,50,50,0.6)" }, // Saturated red mid-glow
    { offset: "80%", color: "rgba(60,0,0,0)" },   // Outer fade
  ],
];

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
  const colorTransitionDuration = 1000; // milliseconds

  // State for wave animation
  const [amplitudeOffset, setAmplitudeOffset] = useState(0);

  // State for color animation
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [animatedColors, setAnimatedColors] = useState(colorPalettes[0]);

  // REFS for wave animation
  const amplitudeRef = useRef(0);
  const isIncreasingRef = useRef(true);

  // REFS for color animation
  const currentColorPaletteRef = useRef(colorPalettes[0]);
  const targetColorPaletteRef = useRef(colorPalettes[0]);
  const colorTransitionStartTimeRef = useRef(0);

  // Wave and Color Animation Loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const step = deltaTime * 0.001 * speed * 20;

      // --- Amplitude Pulsation Logic ---
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
      setAmplitudeOffset(currentAmp);

      // --- Color Transition Logic ---
      const now = performance.now();
      if (colorTransitionStartTimeRef.current > 0 && now < colorTransitionStartTimeRef.current + colorTransitionDuration) {
        const progress = (now - colorTransitionStartTimeRef.current) / colorTransitionDuration;
        const currentPalette = currentColorPaletteRef.current;
        const targetPalette = targetColorPaletteRef.current;
        
        const newAnimatedColors = currentPalette.map((startStop, i) => {
            const endStop = targetPalette[i];
            
            // Interpolate color (RGBA)
            const parseColor = (colorStr) => {
                const parts = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]*)\)/);
                return parts ? {
                    r: parseInt(parts[1]),
                    g: parseInt(parts[2]),
                    b: parseInt(parts[3]),
                    a: parseFloat(parts[4] || '1') 
                } : null;
            };

            const startRGBA = parseColor(startStop.color);
            const endRGBA = parseColor(endStop.color);

            if (!startRGBA || !endRGBA) return startStop; 

            const interpolatedColor = `rgba(${
                Math.round(startRGBA.r + (endRGBA.r - startRGBA.r) * progress)
            },${
                Math.round(startRGBA.g + (endRGBA.g - startRGBA.g) * progress)
            },${
                Math.round(startRGBA.b + (endRGBA.b - startRGBA.b) * progress)
            },${
                (startRGBA.a + (endRGBA.a - startRGBA.a) * progress).toFixed(2)
            })`;
            
            return { offset: startStop.offset, color: interpolatedColor };
        });
        setAnimatedColors(newAnimatedColors);
      } else if (colorTransitionStartTimeRef.current > 0 && now >= colorTransitionStartTimeRef.current + colorTransitionDuration) {
          // Transition finished
          setAnimatedColors(targetColorPaletteRef.current);
          currentColorPaletteRef.current = targetColorPaletteRef.current;
          colorTransitionStartTimeRef.current = 0; 
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [maxAmplitudeOffset, speed, width, colorTransitionDuration]);


  // Helper function to generate the SVG path data
  const generatePath = useCallback((ampBase, ampOffset, thick, waveLen) => {
    let path = `M0 ${height / 2} `;
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (ampBase + ampOffset) * Math.sin((2 * Math.PI * x) / waveLen);
      path += `L${x} ${y} `;
    }
    
    for (let i = points; i >= 0; i--) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (ampBase + ampOffset) * Math.sin((2 * Math.PI * x) / waveLen) +
        thick;
      path += `L${x} ${y} `;
    }
    path += "Z";
    return path;
  }, [height, width, points]);

  const nebulaPath = generatePath(
    baseAmplitude, 
    amplitudeOffset, 
    thickness, 
    wavelength
  );

  // Click handler to cycle colors
  const handleClick = () => {
    const nextIndex = (currentColorIndex + 1) % colorPalettes.length;
    setCurrentColorIndex(nextIndex);
    
    colorTransitionStartTimeRef.current = performance.now();
    targetColorPaletteRef.current = colorPalettes[nextIndex];
  };

  return (
    <div className="App">
      <svg
        className="nebula"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onClick={handleClick} // Add click handler here
      >
        <defs>
          {/* Use radialGradient for central burst effect */}
          <radialGradient id="nebulaGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            {animatedColors.map((stop, index) => (
              <stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </radialGradient>
        </defs>

        <path fill="url(#nebulaGradient)" d={nebulaPath} />

      </svg>
    </div>
  );
}

export default App;