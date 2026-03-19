"use client";

import { memo, useState, useEffect } from "react";
import { Marker } from "react-simple-maps";
import type { CityMarket } from "../types/market";

interface CityMarkerProps {
  city: CityMarket;
  delay: number;
  isSelected: boolean;
  onHover: (city: CityMarket | null) => void;
  onClick: (city: CityMarket) => void;
}

export const CityMarker = memo(function CityMarker({
  city,
  delay,
  isSelected,
  onHover,
  onClick,
}: CityMarkerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseScale, setPulseScale] = useState(8);

  const isActive = city.hasActiveMarket;
  const markerColor = isActive ? city.color : "#555555";

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isActive) return;
    
    let frame: number;
    let start: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = ((timestamp - start) % 2000) / 2000;
      const scale = 8 + Math.sin(progress * Math.PI * 2) * 3;
      setPulseScale(scale);
      frame = requestAnimationFrame(animate);
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isActive]);

  return (
    <Marker coordinates={city.coordinates}>
      <g
        onMouseEnter={() => onHover(city)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(city)}
        style={{ 
          cursor: "pointer", 
          pointerEvents: "auto",
          opacity: isVisible ? 1 : 0,
          transform: `scale(${isVisible ? 1 : 0})`,
          transition: `opacity 0.3s ease, transform 0.3s ease`,
          transformOrigin: "center",
        }}
      >
        {/* Outer pulsing ring — active markets only */}
        {isActive && (
          <circle
            r={pulseScale}
            fill="transparent"
            stroke={city.color}
            strokeWidth={1}
            opacity={0.4 - (pulseScale - 8) / 10}
          />
        )}
        
        {/* Main marker circle */}
        <circle
          r={isSelected ? 7 : 5}
          fill={markerColor}
          stroke="var(--ds-background-100)"
          strokeWidth={2}
          opacity={isActive ? 1 : 0.6}
        />
        
        {/* Inner dot */}
        <circle
          r={2}
          fill="var(--ds-background-100)"
          opacity={isActive ? 0.9 : 0.4}
        />
      </g>
    </Marker>
  );
});
