import React, { useState, useEffect, useRef } from "react";

const NebulaMask = ({ width = 800, height = 600 }) => {
  const [phase, setPhase] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const animationRef = useRef();

  useEffect(() => {
    const animate = () => {
      setPhase((prev) => (prev + 0.025) % (2 * Math.PI));
      setBreathingPhase((prev) => (prev + 0.01) % (2 * Math.PI));
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
  const breathingAmplitude = 20;

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

    return maskHeight + breathingOffset - currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength);
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

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, zIndex: 9999 }}
    >
      <defs>
        {/* Nebula gradient */}
        <linearGradient id="nebulaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000ff" />
          <stop offset="40%" stopColor="#000000ff" />
          <stop offset="100%" stopColor="#000000ff" />
        </linearGradient>

        {/* Wavy mask with gradient fade */}
        <mask id="nebulaMask">
          <rect width={width} height={height} fill="white" />
          <linearGradient id="maskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000ff" stopOpacity="1" />
            <stop offset="90%" stopColor="#000000ff" stopOpacity=".9" />
            <stop offset="95%" stopColor="#006786ff" stopOpacity=".8" />
            <stop offset="100%" stopColor="#006786ff" stopOpacity=".1" />
          </linearGradient>
          <path fill="url(#maskGradient)" d={wavePath} />
        </mask>
      </defs>

      {/* Apply mask to nebula gradient */}
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
