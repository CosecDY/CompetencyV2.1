export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeInOut" },
  },
};
