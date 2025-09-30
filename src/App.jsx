import React, { useState, useEffect } from "react";
import Stars from "./Stars";
import Nebula from "./Nebula";
import NebulaMask from "./NebulaMask";

const App = () => {
  const [phase, setPhase] = useState(0);

  const width = window.innerWidth;
  const height = window.innerHeight;

  useEffect(() => {
    let frameId;
    const animate = (time) => {
      setPhase(time / 1000);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        {/* Background */}
        <rect width={width} height={height} fill="black" />

        {/* Mask definition */}
        <NebulaMask width={width} height={height} maskId="nebulaMask" />

        {/* Apply mask to nebula + stars */}
        <g mask="url(#nebulaMask)">
          <Nebula width={width} height={height} phase={phase} />
          {/* <Stars width={width} height={height} starCount={50} phase={phase} /> */}
        </g>
      </svg>
    </div>
  );
};

export default App;
