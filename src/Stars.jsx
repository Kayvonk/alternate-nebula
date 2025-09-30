import React, { useMemo } from "react";

const Stars = ({ width, height, starCount = 20, filterId, phase }) => {
  const starData = useMemo(() => {
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        cx: Math.random() * width,
        cy: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        isGlimmering: Math.random() < 0.15,
        glimmerSeed: Math.random() * Math.PI * 2,
        glimmerSpeed: Math.random() * 6 + 4, // NEW: vary speed per star
      });
    }
    return stars;
  }, [width, height, starCount]);

  return (
    <g filter={filterId ? `url(#${filterId})` : undefined}>
      {starData.map((star, index) => {
        let finalOpacity = star.opacity;

        if (star.isGlimmering) {
          const glimmerFactor =
            Math.sin(phase * star.glimmerSpeed + star.glimmerSeed) * 0.25 + 0.75;
          finalOpacity = Math.min(1.0, star.opacity * glimmerFactor * 1.2);
        }

        return (
          <circle
            key={index}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#FFFFFF"
            opacity={finalOpacity}
          />
        );
      })}
    </g>
  );
};

export default Stars;
