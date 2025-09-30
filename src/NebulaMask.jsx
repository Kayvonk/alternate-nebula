import { useState, useEffect, useRef } from "react";

const NebulaMask = ({ width = 800, height = 300 }) => {
  const [phase, setPhase] = useState(0);
  const animationRef = useRef();

  const animate = () => {
    setPhase((prev) => (prev + 0.03) % (2 * Math.PI));
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // --- Wavy constants ---
  const amplitude = 20; // wave height
  const wavelength = 200; // distance between peaks
  const points = 400; // resolution
  const glowHeight = height;

  // Base sinusoidal wave
  const getY = (x, pathWidth) =>
    Math.sin((2 * Math.PI * x) / wavelength + phase) * amplitude;

  // Build mask path
  const generatePath = (pathWidth) => {
    const pathPoints = [];
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * pathWidth;
      const y = getY(x, pathWidth);
      pathPoints.push({ x, y });
    }

    let path = `M${pathPoints[0].x} ${pathPoints[0].y} `;
    for (let i = 1; i < pathPoints.length; i++) {
      path += `L${pathPoints[i].x} ${pathPoints[i].y} `;
    }

    // close to bottom
    for (let i = points; i >= 0; i--) {
      const x = (i / points) * pathWidth;
      const y = glowHeight;
      path += `L${x} ${y} `;
    }
    path += "Z";

    return path;
  };

  const maskPath = generatePath(width);

  // --- Dynamic gradient offset (oscillates between 70% and 100%) ---
  const fadeOffset = 0.85 + 0.15 * Math.sin(phase); // value between 0.70 and 1.00

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="maskGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="black" stopOpacity="0.8" />
          <stop
            offset={`${fadeOffset * 100}%`}
            stopColor="black"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path d={maskPath} fill="url(#maskGradient)" />
    </svg>
  );
};

export default NebulaMask;
