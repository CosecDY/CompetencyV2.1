import React from "react";
import { motion } from "framer-motion";

// Memoized particle positions to avoid recalculation on each render
const PARTICLE_POSITIONS = Array.from({ length: 6 }, (_, i) => ({
  id: `particle-${i}`,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 3 + Math.random() * 2,
}));

const OptimizedBackgroundDecor = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
    {/* Simplified gradient orbs using CSS animations for better performance */}
    <div
      className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200 via-blue-200 to-purple-200 rounded-full blur-3xl animate-pulse"
      style={{
        animationDuration: "8s",
        opacity: 0.3,
      }}
    />
    <div
      className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-200 via-teal-200 to-cyan-200 rounded-full blur-3xl animate-bounce"
      style={{
        animationDuration: "10s",
        opacity: 0.3,
      }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-full blur-3xl animate-spin"
      style={{
        animationDuration: "15s",
      }}
    />

    {/* Reduced particles for better performance */}
    {PARTICLE_POSITIONS.slice(0, 4).map(
      ({ id, left, top, delay, duration }) => (
        <motion.div
          key={id}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        />
      )
    )}
  </div>
));

OptimizedBackgroundDecor.displayName = "OptimizedBackgroundDecor";

export default OptimizedBackgroundDecor;
