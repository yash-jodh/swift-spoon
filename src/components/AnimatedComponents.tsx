import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ReactNode, useState, useRef, useEffect } from "react";

/* FLOATING CARD */

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const FloatingCard = ({
  children,
  delay = 0,
  className = "",
}: FloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -10,
        scale: 1.02,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        transition: { duration: 0.3 },
      }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.6,
        type: "spring" as const,
        stiffness: 100,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* FLIP CARD */

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export const FlipCard = ({ front, back, className = "" }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        <div style={{ backfaceVisibility: "hidden" }} className="absolute inset-0">
          {front}
        </div>

        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0"
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

/* PARALLAX */

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax = ({
  children,
  speed = 0.5,
  className = "",
}: ParallaxProps) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

/* MAGNETIC BUTTON */

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton = ({
  children,
  className = "",
  onClick,
}: MagneticButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  return (
    <motion.button
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

/* STAGGER */

export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  className = "",
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay },
    },
  };

  return (
    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className={className}>
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
};

/* FADE IN SCROLL */

export const FadeInScroll = ({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* PULSE */

export const PulseGlow = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px rgba(255,107,107,0.3)",
          "0 0 40px rgba(255,107,107,0.6)",
          "0 0 20px rgba(255,107,107,0.3)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
