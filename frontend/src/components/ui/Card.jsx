import { motion } from 'framer-motion';

export default function Card({ children, className = '', padding = true, ...motionProps }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${padding ? 'p-5' : ''} ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
