import React from 'react';
import { motion } from 'motion/react';
import { Hexagon, Zap } from 'lucide-react';

interface EchobeesLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function EchobeesLogo({ size = 'md' }: EchobeesLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-10 h-10',
      hexagon: 'w-7 h-7 text-amber-400',
      zap: 'w-3.5 h-3.5 text-black',
      glowingBg: 'w-7 h-7 bg-amber-500/15',
    },
    md: {
      container: 'w-12 h-12',
      hexagon: 'w-9 h-9 text-amber-450',
      zap: 'w-4 h-4 text-black',
      glowingBg: 'w-9 h-9 bg-amber-500/20',
    },
    lg: {
      container: 'w-16 h-16',
      hexagon: 'w-12 h-12 text-amber-450',
      zap: 'w-5.5 h-5.5 text-black',
      glowingBg: 'w-12 h-12 bg-amber-500/25',
    }
  };

  const current = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center ${current.container}`}>
      {/* Outer concentric pulsing sound and communication echoes - hardware accelerated scale and opacity */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.08, 0.25],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: "transform, opacity" }}
        className={`absolute rounded-full border border-amber-500/15 pointer-events-none ${
          size === 'lg' ? 'w-24 h-24' : size === 'md' ? 'w-18 h-18' : 'w-14 h-14'
        }`}
      />

      <motion.div
        animate={{
          scale: [1, 1.45, 1],
          opacity: [0.12, 0.03, 0.12],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.75
        }}
        style={{ willChange: "transform, opacity" }}
        className={`absolute rounded-full border border-yellow-500/10 pointer-events-none ${
          size === 'lg' ? 'w-32 h-32' : size === 'md' ? 'w-24 h-24' : 'w-18 h-18'
        }`}
      />

      {/* Cybernetic ambient honeycomb glow background with static blur - fully GPU accelerated */}
      <motion.div
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: "transform, opacity" }}
        className={`absolute rounded-full pointer-events-none blur-md lg:blur-lg ${current.glowingBg}`}
      />

      {/* Main Hexagonal Honeycomb Shell */}
      <motion.div
        whileHover={{ scale: 1.12, rotate: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 flex items-center justify-center bg-transparent cursor-pointer"
      >
        <Hexagon 
          className={`${current.hexagon} fill-amber-450/10 transition-colors duration-300`}
          strokeWidth={1.5}
        />
        
        {/* Core Energized Bee Strike / Spark inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [0.95, 1.08, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ willChange: "transform" }}
            className="w-1/2 h-1/2 rounded-full bg-amber-450 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.55)]"
          >
            <Zap className={`${current.zap}`} fill="currentColor" />
          </motion.div>
        </div>

        {/* Double hovering cybernetic wings (Left and Right) with realistic premium breathing hover, instead of high-frequency lag flutter */}
        <motion.div
          animate={{
            rotate: [-25, -15, -25],
            scaleX: [1, 1.15, 1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ willChange: "transform" }}
          className="absolute -left-1.5 w-3.5 h-1 bg-amber-400/80 rounded-sm origin-right shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        />
        <motion.div
          animate={{
            rotate: [25, 15, 25],
            scaleX: [1, 1.15, 1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
          style={{ willChange: "transform" }}
          className="absolute -right-1.5 w-3.5 h-1 bg-amber-400/80 rounded-sm origin-left shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        />
      </motion.div>
    </div>
  );
}

