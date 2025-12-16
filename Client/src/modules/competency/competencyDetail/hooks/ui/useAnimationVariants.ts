import { useMemo } from "react";

export const useAnimationVariants = () => {
  return useMemo(
    () => ({
      containerVariants: {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            staggerChildren: 0.05,
            ease: "easeOut",
            // Optimize will-change usage
            willChange: "opacity, transform",
          },
        },
      },
      itemVariants: {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.2,
            ease: "easeOut",
            // Optimize will-change usage
            willChange: "opacity, transform",
          },
        },
      },
      buttonVariants: {
        hover: {
          scale: 1.02,
          transition: { 
            duration: 0.1, 
            ease: "easeOut",
            willChange: "transform",
          },
        },
        tap: {
          scale: 0.98,
          transition: { 
            duration: 0.05, 
            ease: "easeInOut",
            willChange: "transform",
          },
        },
      },
      // Reduced motion variants for accessibility
      reducedMotionVariants: {
        hidden: { opacity: 0.8 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.1 },
        },
      },
    }),
    []
  );
};
