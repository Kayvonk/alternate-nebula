import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const width = 800;
  const height = 200;
  const baseAmplitude = 30;
  const thickness = 60;
  const wavelength = 200;
  const points = 160;

  const [amplitudeOffset, setAmplitudeOffset] = useState(0);

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.02;
      // Fluctuate amplitude with a slow sine function
      const offset = 10 * Math.sin(t);
      setAmplitudeOffset(offset);
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const path = (() => {
    let path = `M0 ${height / 2} `;
    // top wave
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y =
        height / 2 + (baseAmplitude + amplitudeOffset) * Math.sin((2 * Math.PI * x) / wavelength);
      path += `L${x} ${y} `;
    }
    // bottom wave
    for (let i = points; i >= 0; i--) {
      const x = (i / points) * width;
      const y =
        height / 2 +
        (baseAmplitude + amplitudeOffset) * Math.sin((2 * Math.PI * x) / wavelength) +
        thickness;
      path += `L${x} ${y} `;
    }
    path += "Z";
    return path;
  })();

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
