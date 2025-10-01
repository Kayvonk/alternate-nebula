import React, { useState, useEffect, useRef } from "react";

const Nebula = () => {
    const [phase, setPhase] = useState(0);
    const animationRef = useRef();

    const animate = () => {
        setPhase((prevPhase) => (prevPhase + 0.025) % (2 * Math.PI));
        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, []);

    // --- Static Constants ---
    const width = 800;
    const height = 600;
    const baseAmplitude = 10;
    const amplitudeVariation = 0.2;
    const thickness = 2;
    const baseWavelength = 200;
    const points = 800;
    const segments = 5;
    const amplitudeAnimationFactor = 10;

    const glowHeight = 350;
    const secondWidth = width;
    const rotationAngle = 0;
    const thirdWidth = width;
    const thirdRotationAngle = 0;
    const rotationCenter = `${width / 2} ${height / 2}`;

    const purpleGlowID = "purpleGlowGradient";
    const cyanGlowID = "cyanGlowGradient";
    const blueGlowID = "blueGlowGradient";

    const centerLineY = height / 2;
    const silhouetteColor = "#000000";

    // Top mask constants
    const topMaskYCenter = 0; // start at the top
    const topMaskFillThickness = 300; // taller to cover top fade
    const topWaveWavelength = 150;
    const topWavePhaseSpeedMultiplier = 3;
    const topWaveAmplitudeFactor = 0.5;
    const topMaskColor = "#000000";

    const blurFilterID = "topLineBlur";
    const blurAmount = 15;

    const getRandomOffset = (factor) => (Math.random() - 0.5) * 2 * factor;

    const baseAmplitudeControls = useRef([]);
    if (baseAmplitudeControls.current.length === 0) {
        for (let i = 0; i < segments + 1; i++) {
            baseAmplitudeControls.current.push(
                1 + getRandomOffset(amplitudeVariation)
            );
        }
    }

    const getBaseY = (x, pathWidth, isBottom, isGlowTop, phaseOffset = 0) => {
        const normalizedX = x / pathWidth;
        const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
        const t = normalizedX * segments - Math.floor(normalizedX * segments);
        const nextIndex = Math.min(segmentIndex + 1, segments);

        const baseAmpModifier =
            baseAmplitudeControls.current[segmentIndex] * (1 - t) +
            baseAmplitudeControls.current[nextIndex] * t;

        const oscillation =
            Math.sin((2 * Math.PI * x) / (baseWavelength * 2) + phase + phaseOffset) *
            amplitudeAnimationFactor;

        const currentAmplitude = baseAmplitude * baseAmpModifier + oscillation;

        let y =
            centerLineY +
            currentAmplitude * Math.sin((2 * Math.PI * x) / baseWavelength);

        if (isBottom) {
            y += thickness;
        }

        if (isGlowTop) {
            y -= glowHeight;
        }

        return y;
    };

    const generatePath = (pathWidth, includeGlowTop, phaseOffset = 0) => {
        const pathPoints = [];
        for (let i = 0; i <= points; i++) {
            const x = (i / points) * pathWidth;
            const y = getBaseY(x, pathWidth, false, false, phaseOffset);
            pathPoints.push({ x, y });
        }

        let path = `M${pathPoints[0].x} ${pathPoints[0].y} `;
        for (let i = 1; i < pathPoints.length; i++) {
            path += `L${pathPoints[i].x} ${pathPoints[i].y} `;
        }

        if (includeGlowTop) {
            path += `L${pathPoints[pathPoints.length - 1].x} 0 L0 0 Z`;
        } else {
            for (let i = points; i >= 0; i--) {
                const x = (i / points) * pathWidth;
                const y = getBaseY(x, pathWidth, true, false, phaseOffset);
                path += `L${x} ${y} `;
            }
            path += "Z";
        }

        return path;
    };

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

            const segmentIndex = Math.min(Math.floor(normalizedX * segments), segments);
            const t = normalizedX * segments - Math.floor(normalizedX * segments);
            const nextIndex = Math.min(segmentIndex + 1, segments);

            const baseAmpModifier =
                baseAmplitudeControls.current[segmentIndex] * (1 - t) +
                baseAmplitudeControls.current[nextIndex] * t;

            const oscillation =
                Math.sin(
                    (2 * Math.PI * x) / (baseWavelength * 2) +
                        phase * topWavePhaseSpeedMultiplier
                ) *
                amplitudeAnimationFactor *
                topWaveAmplitudeFactor;

            const currentAmplitude =
                baseAmplitude * topWaveAmplitudeFactor * baseAmpModifier + oscillation;

            // Shift mask to start from top
            let y =
                yCenter + currentAmplitude * Math.sin((2 * Math.PI * x) / wavelength);

            topEdgePoints.push({ x, y: y });
            bottomEdgePoints.push({ x, y: y + fillThickness });
        }

        let path = `M${topEdgePoints[0].x} ${topEdgePoints[0].y} `;
        for (let i = 1; i < topEdgePoints.length; i++) {
            path += `L${topEdgePoints[i].x} ${topEdgePoints[i].y} `;
        }

        for (let i = bottomEdgePoints.length - 1; i >= 0; i--) {
            path += `L${bottomEdgePoints[i].x} ${bottomEdgePoints[i].y} `;
        }

        path += "Z";
        return path;
    };

    const mainDarkPath = generatePath(width, false, 0);
    const mainGlowPath = generatePath(width, true, 0);
    const topMaskPath = generateTopMaskPath();

    const secondDarkPath = generatePath(secondWidth, false, 0);
    const secondGlowPath = generatePath(secondWidth, true, Math.PI * 2 / 3);

    const thirdDarkPath = generatePath(thirdWidth, false, 0);
    const thirdGlowPath = generatePath(thirdWidth, true, Math.PI / 3);

    return (
        <svg
            className="nebula"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <filter id={blurFilterID} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} />
                </filter>

                <linearGradient id={purpleGlowID} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#7F00FF", stopOpacity: 1.0 }} />
                    <stop offset="40%" style={{ stopColor: "#00FFFF", stopOpacity: 0.3 }} />
                    <stop offset="80%" style={{ stopColor: "#000000", stopOpacity: 0.0 }} />
                </linearGradient>

                <linearGradient id={cyanGlowID} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#00FFFF", stopOpacity: 1.0 }} />
                    <stop offset="40%" style={{ stopColor: "#4169E1", stopOpacity: 0.3 }} />
                    <stop offset="80%" style={{ stopColor: "#000000", stopOpacity: 0.0 }} />
                </linearGradient>

                <linearGradient id={blueGlowID} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#4169E1", stopOpacity: 1.0 }} />
                    <stop offset="40%" style={{ stopColor: "#8332d3ff", stopOpacity: 0.3 }} />
                    <stop offset="80%" style={{ stopColor: "#8f2e2eff", stopOpacity: 0.0 }} />
                </linearGradient>
            </defs>

            <path
                fill={`url(#${purpleGlowID})`}
                d={mainGlowPath}
                opacity="0.7"
                style={{ mixBlendMode: "screen" }}
            />

            <path
                fill={`url(#${cyanGlowID})`}
                d={thirdGlowPath}
                opacity="0.2"
                style={{ mixBlendMode: "screen" }}
                transform={`translate(${width / 2 - thirdWidth / 2}, 0) rotate(${thirdRotationAngle}, ${rotationCenter})`}
            />

            <path
                fill={`url(#${blueGlowID})`}
                d={secondGlowPath}
                opacity=".5"
                style={{ mixBlendMode: "screen" }}
                transform={`translate(${width / 2 - secondWidth / 2}, 0) rotate(${rotationAngle}, ${rotationCenter})`}
            />

            <path
                fill={topMaskColor}
                stroke="none"
                d={topMaskPath}
                opacity=".25"
                filter={`url(#${blurFilterID})`}
            />

            <path fill={silhouetteColor} opacity="0.1" d={mainDarkPath} />

            <path
                fill={silhouetteColor}
                d={thirdDarkPath}
                transform={`translate(${width / 2 - thirdWidth / 2}, 0) rotate(${thirdRotationAngle}, ${rotationCenter})`}
                opacity="0.1"
            />

            <path
                fill={silhouetteColor}
                d={secondDarkPath}
                transform={`translate(${width / 2 - secondWidth / 2}, 0) rotate(${rotationAngle}, ${rotationCenter})`}
                opacity="0.1"
            />
        </svg>
    );
};

export default Nebula;
