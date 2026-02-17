import { motion } from 'framer-motion';

export function AIMessageBlock({ role, content }: { role: 'ai' | 'user'; content: string }) {
  const isAI = role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
      className={isAI ? 'rounded-xl border border-line bg-panel p-3 text-sm text-text' : 'ml-auto max-w-[80%] rounded-xl bg-accent/90 p-3 text-sm text-white'}
      aria-live={isAI ? 'polite' : undefined}
    >
      {content}
    </motion.div>
  );
}
