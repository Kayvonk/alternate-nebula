import React, { useState, useEffect } from "react";
import Stars from "./Stars";
import Nebula from "./Nebula";
import NebulaMask from "./NebulaMask";

const App = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let frameId;
    const animate = (time) => {
      setPhase(time / 1000);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        <rect width={width} height={height} fill="black" />
        <Nebula width={width} height={height} phase={phase} />
        <Stars width={width} height={height} starCount={50} phase={phase} />
      </svg>

      {/* Overlay mask */}
      <NebulaMask width={width} height={height/2} />
    </div>
  );
};

export default App;
