import React, { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  // Use Framer Motion spring for smooth number animation
  const animatedProgress = useSpring(0, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Define loading stages with bigger jumps (like 0 → 40 → 77 → 100)
    const stages = [0, 35, 68, 85, 100];
    let currentStageIndex = 0;

    const interval = setInterval(() => {
      if (currentStageIndex < stages.length) {
        setProgress(stages[currentStageIndex]);
        currentStageIndex++;
      }

      if (currentStageIndex >= stages.length) {
        clearInterval(interval);
        // Small delay before fading out
        setTimeout(() => {
          onComplete?.();
        }, 400);
      }
    }, 600); // 600ms between each jump (slower, more dramatic)

    return () => clearInterval(interval);
  }, [onComplete]);

  // Update animated value when progress changes
  useEffect(() => {
    animatedProgress.set(progress);
  }, [progress, animatedProgress]);

  // Circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      {/* Main loading container - centered */}
      <div className="relative flex items-center justify-center">
        {/* Circular progress */}
        <div className="relative w-80 h-80">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
              fill="none"
            />
            {/* Progress circle - single color (white) */}
            <motion.circle
              cx="160"
              cy="160"
              r={radius}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset:
                  circumference - (progress / 100) * circumference,
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
            />
          </svg>

          {/* Percentage in center - animated */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-8xl font-bold text-white tabular-nums"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Smooth number transition */}
              <motion.span>{animatedProgress.get().toFixed(0)}</motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
