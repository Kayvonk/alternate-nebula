import React, { useState, useEffect, useRef } from "react";
// Load lucide icons for modern aesthetics (using an inline SVG as a placeholder for a star/icon, if needed)

const App = () => {
  // 1. Animation State Setup
  const [phase, setPhase] = useState(0);
  const animationRef = useRef();

  // --- Animation Loop Setup ---
  const animate = () => {
    // Increments the phase to drive the wave animation
    setPhase((prevPhase) => (prevPhase + 0.005) % (2 * Math.PI));
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Start the animation loop when the component mounts
    animationRef.current = requestAnimationFrame(animate);
    // Clean up the animation frame when the component unmounts
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // --- Static Constants ---
  const width = 800;
  const height = 600; // Taller SVG height for more canvas space
  const baseAmplitude = 30;
  const amplitudeVariation = 0.6;
  const thickness = 2; // Reduced thickness to make the silhouettes thin and unnoticeable
  const baseWavelength = 200;
  const points = 800;
  const segments = 5;
  const amplitudeAnimationFactor = 20;

  const glowHeight = 350; // Pushes the glow's top edge much higher
  const secondWidth = width * 0.5;
  const rotationAngle = 10;
  // Constants for the third, intermediate layer
  const thirdWidth = width * 0.75; // 75% width
  const thirdRotationAngle = -5; // Rotated slightly to the left

  const rotationCenter = `${width / 2} ${height / 2}`;
  const glowGradientID = "glowGradient";
  const centerLineY = height / 2; // New center is 300
  const silhouetteColor = "#7F00FF"; // MODIFIED: Bright purple to match the gradient start
  const backgroundColor = "#000000"; // Pure Black Background

  // --- New Top Mask Constants (For the Fade Effect) ---
  const topMaskYCenter = height * 0.15; // Vertical position near the top (y=90)
  const topMaskFillThickness = 150; 
  const topWaveWavelength = 150;
  const topWavePhaseSpeedMultiplier = 3;
  const topWaveAmplitudeFactor = 0.5;
  const topMaskColor = "#000000"; // Black for masking

  // --- Blur Filter Constants ---
  const blurFilterID = "topLineBlur"; 
  const blurAmount = 15; 


  // Helper function for generating a random value around zero
  const getRandomOffset = (factor) => (Math.random() - 0.5) * 2 * factor;

  // 2. Store the base amplitude control points permanently using useRef
  const baseAmplitudeControls = useRef([]);

  if (baseAmplitudeControls.current.length === 0) {
    for (let i = 0; i < segments + 1; i++) {
      // Initialize control points for non-uniform wave amplitude
      baseAmplitudeControls.current.push(
        1 + getRandomOffset(amplitudeVariation)
      );
    }
  }
  
  // 3. Function to calculate the base Y position (incorporating fluid motion)
  const getBaseY = (x, pathWidth, isBottom, isGlowTop) => {
    const normalizedX = x / pathWidth;
    // Determine which segment of the wave we are in (for non-uniform amplitude)
    const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
    // t is the fractional distance within the current segment
    const t = normalizedX * segments - Math.floor(normalizedX * segments);
    const nextIndex = Math.min(segmentIndex + 1, segments);
    
    // Linearly interpolate between the two control points for smooth amplitude variation
    const baseAmpModifier =
      baseAmplitudeControls.current[segmentIndex] * (1 - t) +
      baseAmplitudeControls.current[nextIndex] * t;
      
    // Calculate the dynamic, time-based oscillation
    const oscillation =
      Math.sin((2 * Math.PI * x) / (baseWavelength * 2) + phase) *
      amplitudeAnimationFactor;
      
    // Calculate the combined amplitude
    const currentAmplitude = baseAmplitude * baseAmpModifier + oscillation;

    // Calculate the final Y position using a sine wave
    let y =
      centerLineY +
      currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength);
      
    // Adjust for the bottom path (adds thickness)
    if (isBottom) {
      y += thickness;
    }
    
    // Adjust for the glow top path (pushes the glow upwards)
    if (isGlowTop) {
      y -= glowHeight;
    }

    return y;
  }; 
  
  // 4. Path Generation Function for the main dark nebula shapes and glow
  const generatePath = (pathWidth, includeGlowTop) => {
    const pathPoints = []; 
    // Generate points for the TOP line of the dark cloud / BOTTOM line of the glow (Left-to-Right)
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * pathWidth;
      const y = getBaseY(x, pathWidth, false, false);
      pathPoints.push({ x, y });
    }

    let path = `M${pathPoints[0].x} ${pathPoints[0].y} `;
    for (let i = 1; i < pathPoints.length; i++) {
      path += `L${pathPoints[i].x} ${pathPoints[i].y} `;
    }
    if (includeGlowTop) {
      // If generating the glow path, close the shape by tracing a straight line to the top corners of the SVG
      path += `L${pathPoints[pathPoints.length - 1].x} 0 L0 0 Z`;
    } else {
      // If generating the dark cloud, trace the bottom wave (Right-to-Left) and close
      for (let i = points; i >= 0; i--) {
        const x = (i / points) * pathWidth;
        const y = getBaseY(x, pathWidth, true, false);
        path += `L${x} ${y} `;
      }
      path += "Z";
    }

    return path;
  };

  // 4.1 New function for the top mask path (generates a filled ribbon shape)
  const generateTopMaskPath = () => {
    const pathWidth = width;
    const yCenter = topMaskYCenter;
    const wavelength = topWaveWavelength;
    const fillThickness = topMaskFillThickness;

    const topEdgePoints = [];
    const bottomEdgePoints = [];

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * pathWidth;
      const normalizedX = x / pathWidth;

      // Reuse base amplitude controls for non-uniform look
      const segmentIndex = Math.min(
        Math.floor(normalizedX * segments),
        segments
      );
      const t = normalizedX * segments - Math.floor(normalizedX * segments);
      const nextIndex = Math.min(segmentIndex + 1, segments);

      const baseAmpModifier =
        baseAmplitudeControls.current[segmentIndex] * (1 - t) +
        baseAmplitudeControls.current[nextIndex] * t;

      // Dynamic oscillation
      const oscillation =
        Math.sin(
          (2 * Math.PI * x) / (baseWavelength * 2) +
          phase * topWavePhaseSpeedMultiplier
        ) *
        amplitudeAnimationFactor *
        topWaveAmplitudeFactor;

      const currentAmplitude =
        baseAmplitude * topWaveAmplitudeFactor * baseAmpModifier + oscillation;

      // Calculate the center Y position
      let y =
        yCenter + currentAmplitude * Math.sin((2 * Math.PI * x) / wavelength);

      // Define the top and bottom edges of the ribbon shape
      topEdgePoints.push({ x, y: y - fillThickness / 2 });
      bottomEdgePoints.push({ x, y: y + fillThickness / 2 });
    }

    // 1. Start path at the top-left edge
    let path = `M${topEdgePoints[0].x} ${topEdgePoints[0].y} `;

    // 2. Trace the top edge (Left-to-Right)
    for (let i = 1; i < topEdgePoints.length; i++) {
      path += `L${topEdgePoints[i].x} ${topEdgePoints[i].y} `;
    }

    // 3. Trace the bottom edge (Right-to-Left)
    for (let i = bottomEdgePoints.length - 1; i >= 0; i--) {
      path += `L${bottomEdgePoints[i].x} ${bottomEdgePoints[i].y} `;
    }

    // 4. Close the path
    path += "Z";
    return path;
  };

  const mainDarkPath = generatePath(width, false);
  const mainGlowPath = generatePath(width, true); // Path for the background glow
  const topMaskPath = generateTopMaskPath(); // Use the new mask path function

  const secondDarkPath = generatePath(secondWidth, false);
  const secondGlowPath = generatePath(secondWidth, true); // Path for the second glow

  // Paths for the third layer
  const thirdDarkPath = generatePath(thirdWidth, false);
  const thirdGlowPath = generatePath(thirdWidth, true); 

  const styleSheet = `
    /* CORE FIX: The margin issue is fixed by explicitly resetting margins 
       on html and body elements which often carry an 8px default margin 
       from the browser's User Agent Stylesheet. */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100%;
      width: 100%;
    }
    
    .App {
      /* Uses the updated pure black color */
      background-color: ${backgroundColor}; 
      min-height: 100vh; /* Ensure it covers the full viewport height */
      min-width: 100vw; /* Ensure it covers the full viewport width */
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .nebula {
      width: 100%;
      max-width: 100vw; 
      height: 100%;
      /* Ensure the SVG is centered within the App container */
      position: relative;
    }
  `;

  return (
    <div className="App">
      {/* This style tag injects the necessary CSS reset for body/html 
        and the container styling, ensuring the margin is zeroed out 
        and the content is centered without relying on Tailwind.
      */}
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      
      <svg
        className="nebula" // Uses custom CSS class for sizing and centering
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice" // Ensures it scales nicely
      >
        <defs>
          {/* Define the Gaussian Blur Filter for the top line/mask */}
          <filter id={blurFilterID} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} />
          </filter>
          
          {/* 5. Define the Vertical Glow Gradient - Rich nebula purple to transparent black */}
          <linearGradient id={glowGradientID} x1="0%" y1="100%" x2="0%" y2="0%">
            {/* 0% Offset (Bottom of SVG) - Rich Violet/Purple */}
            <stop
              offset="0%"
              style={{ stopColor: "#7F00FF", stopOpacity: 1.0 }} // Rich, full opacity violet
            />
            
            {/* 100% Offset (Top of SVG) - Transparent Black to blend with background */}
            <stop
              offset="100%"
              style={{ stopColor: "#000000", stopOpacity: 0.0 }}
            />
          </linearGradient>
        </defs>
        
        {/* 6. GLOW PATHS (Rendered first, from back to front) */}
        
        {/* MAIN (FULL WIDTH) GLOW - Furthest Back */}
        <path fill={`url(#${glowGradientID})`} d={mainGlowPath} />
        
        {/* THIRD (75% WIDTH) GLOW - Intermediate Depth */}
        <path 
          fill={`url(#${glowGradientID})`} 
          d={thirdGlowPath}
          transform={`translate(${width / 2 - thirdWidth / 2
            }, 0) rotate(${thirdRotationAngle}, ${rotationCenter})`}
        />

        {/* SECOND (50% WIDTH) GLOW - Closest Light */}
        <path 
          fill={`url(#${glowGradientID})`} 
          d={secondGlowPath}
          transform={`translate(${width / 2 - secondWidth / 2
            }, 0) rotate(${rotationAngle}, ${rotationCenter})`}
        />
        
        {/* 8. TOP BLACK DYNAMIC MASK (Covers and fades the glow below) */}
        <path
          fill={topMaskColor} // Filled with black
          stroke="none"      // No stroke needed
          d={topMaskPath}
          opacity="1.0"      // Fully opaque to block light
          filter={`url(#${blurFilterID})`}
        />
        
        {/* 7. Animated Dark Nebula Shapes (Rendered last, from back to front) */}
        
        {/* MAIN (FULL WIDTH) SHAPE - Furthest Back */}
        <path fill={silhouetteColor} d={mainDarkPath} />
        
        {/* THIRD (75% WIDTH) SHAPE - Intermediate Depth */}
        <path
          fill={silhouetteColor}
          d={thirdDarkPath}
          transform={`translate(${width / 2 - thirdWidth / 2
            }, 0) rotate(${thirdRotationAngle}, ${rotationCenter})`}
          opacity="0.85" // Slightly less translucent than the closest layer
        />

        {/* SECOND (50% WIDTH) SHAPE - Closest Shape */}
        <path
          fill={silhouetteColor}
          d={secondDarkPath}
          transform={`translate(${width / 2 - secondWidth / 2
            }, 0) rotate(${rotationAngle}, ${rotationCenter})`}
          opacity="0.8" // Most translucent (appears closest)
        />
      </svg>
    </div>
  );
}

export default App;
