import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrueFocusText from '../Motion/TrueFocusText';
import { useAppStore } from '../../store';

const PageTransition = () => {
  const { isLoading } = useAppStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-color)]"
        >
          <div className="mb-8 text-center">
             <TrueFocusText text="欢迎回来" className="text-2xl font-bold mb-2 block" />
             <TrueFocusText text="Loading...." className="text-lg text-[var(--text-color-secondary)] block" delay={0.5} />
          </div>
          <img src="/loading/Loading.gif" alt="Loading" className="w-16 h-16" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransition;
