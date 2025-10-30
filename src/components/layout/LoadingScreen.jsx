import React, { useEffect } from "react";
import { motion } from "framer-motion";

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const eritlyLetters = "ERITLY".split("");
  const aiLetters = "AI".split("");

  // V letter animation - smooth drop from top
  const vVariants = {
    hidden: { y: -300, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Letter animation - smooth slide (no overflow needed)
  const letterVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.5 + i * 0.06,
      },
    }),
  };

  // AI letter animation
  const aiLetterVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.85 + i * 0.06,
      },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Container */}
      <div className="flex items-center gap-6">
        {/* VERITLY */}
        <div className="flex items-center">
          {/* V Letter */}
          <motion.span
            className="font-bold text-white whitespace-nowrap"
            style={{
              fontSize: "5rem",
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
            variants={vVariants}
            initial="hidden"
            animate="visible"
          >
            V
          </motion.span>

          {/* ERITLY - No overflow hidden wrapper */}
          <div className="flex items-center">
            {eritlyLetters.map((letter, i) => (
              <motion.span
                key={i}
                className="font-bold text-white whitespace-nowrap"
                style={{
                  fontSize: "5rem",
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                }}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* AI - No overflow hidden wrapper */}
        <div className="flex items-center">
          {aiLetters.map((letter, i) => (
            <motion.span
              key={i}
              className="font-bold text-white whitespace-nowrap"
              style={{
                fontSize: "5rem",
                letterSpacing: "-0.05em",
                lineHeight: 1,
              }}
              custom={i}
              variants={aiLetterVariants}
              initial="hidden"
              animate="visible"
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
