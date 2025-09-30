import React, { useState, useEffect, useRef } from "react";

const NebulaMask = ({ width = 800, height = 600 }) => {
  const [phase, setPhase] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const animationRef = useRef();

  useEffect(() => {
    const animate = () => {
      setPhase((prev) => (prev + 0.025) % (2 * Math.PI));
      setBreathingPhase((prev) => (prev + 0.005) % (2 * Math.PI));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const points = 800;
  const segments = 5;
  const baseAmplitude = 10;
  const amplitudeVariation = 0.2;
  const baseWavelength = 200;
  const amplitudeAnimationFactor = 10;

  const maskHeight = height / 4;
  const centerLineY = maskHeight;
  const breathingAmplitude = 50;

  const baseAmplitudeControls = useRef([]);
  if (baseAmplitudeControls.current.length === 0) {
    for (let i = 0; i <= segments; i++) {
      baseAmplitudeControls.current.push(
        1 + (Math.random() - 0.5) * 2 * amplitudeVariation
      );
    }
  }

  const getY = (x) => {
    const normalizedX = x / width;
    const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
    const t = normalizedX * segments - segmentIndex;
    const nextIndex = Math.min(segmentIndex + 1, segments);

    const baseAmpModifier =
      baseAmplitudeControls.current[segmentIndex] * (1 - t) +
      baseAmplitudeControls.current[nextIndex] * t;

    const oscillation =
      Math.sin((2 * Math.PI * x) / (baseWavelength * 2) + phase) *
      amplitudeAnimationFactor;

    const currentAmplitude = baseAmplitude * baseAmpModifier + oscillation;
    const breathingOffset = Math.sin(breathingPhase) * breathingAmplitude;

    return centerLineY + breathingOffset - currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength);
  };

  const generateWavePath = () => {
    const pathPoints = [];
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = getY(x);
      pathPoints.push({ x, y });
    }

    let path = `M${pathPoints[0].x} ${pathPoints[0].y}`;
    for (let i = 1; i < pathPoints.length; i++) {
      path += ` L${pathPoints[i].x} ${pathPoints[i].y}`;
    }
    for (let i = points; i >= 0; i--) {
      const { x } = pathPoints[i];
      path += ` L${x} 0`;
    }
    path += " Z";
    return path;
  };

  const wavePath = generateWavePath();

  // Dynamic offset for middle stop based on breathing
  const dynamicOffset = 50 + 40 * Math.sin(breathingPhase); // ranges from 10% to 90%

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="nebulaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000ff" />
          <stop offset="90%" stopColor="#000000ff" />
          <stop offset="100%" stopColor="#000000ff" />
        </linearGradient>

        <linearGradient id="maskGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#036a7cff" stopOpacity="1" />
          <stop offset={`${dynamicOffset}%`} stopColor="#006b96ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffffff" stopOpacity="0.3" />
        </linearGradient>

        <mask id="nebulaMask">
          <rect width={width} height={height} fill="white" />
          <path fill="url(#maskGradient)" d={wavePath} />
        </mask>
      </defs>

      <rect
        width={width}
        height={height}
        fill="url(#nebulaGradient)"
        mask="url(#nebulaMask)"
      />
    </svg>
  );
};

export default NebulaMask;
