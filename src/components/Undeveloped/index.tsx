import React from 'react';
import ScrollVelocityText from '../Motion/ScrollVelocityText';
import { motion } from 'framer-motion';
import { FiCode, FiClock, FiTool } from 'react-icons/fi';

interface UndevelopedPageProps {
  title?: string;
  description?: string;
  className?: string;
}

const DECORATIVE_SYMBOLS = ['<', '>', '{', '}', '(', ')', '[', ']'].map((symbol) => ({
  symbol,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
}));

const UndevelopedPage: React.FC<UndevelopedPageProps> = ({
  title = '尚未开发',
  description = '该功能正在紧张开发中，敬请期待...',
  className = '',
}) => {
  return (
    <div className={`h-full min-h-[calc(100vh-200px)] bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center relative overflow-hidden rounded-lg ${className}`}>
      <div className="text-center space-y-8 p-8 z-10 w-full max-w-4xl">
        {/* 主标题 */}
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* 背景滚动文字 - 撑开高度 */}
          <div className="opacity-15 pointer-events-none select-none">
             <ScrollVelocityText
                text={title}
                className="text-6xl md:text-8xl font-bold text-[var(--primary-color)] py-2"
              />
          </div>
          
          {/* 前景标题 - 绝对定位居中 */}
          <motion.h1
            className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-[var(--text-color)] z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {title}
          </motion.h1>
        </motion.div>

        {/* 图标组 */}
        <motion.div
          className="flex items-center justify-center gap-6 my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <FiCode className="w-12 h-12 text-[var(--primary-color)]" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FiClock className="w-12 h-12 text-[var(--primary-color)]" />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <FiTool className="w-12 h-12 text-[var(--primary-color)]" />
          </motion.div>
        </motion.div>

        {/* 描述文字 */}
        <motion.p
          className="text-lg text-[var(--text-color-secondary)] max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {description}
        </motion.p>

        {/* 进度条动画 */}
        <motion.div
          className="w-64 h-2 bg-[var(--border-color)] rounded-full mx-auto overflow-hidden"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 256 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            className="h-full bg-[var(--primary-color)] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '70%', '30%', '90%', '60%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.3, 0.5, 0.8, 1],
            }}
          />
        </motion.div>

        {/* 提示文字 */}
        <motion.div
          className="text-sm text-[var(--text-color-secondary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <p>开发进度：正在进行中...</p>
          <p className="mt-2">预计完成时间：敬请期待</p>
        </motion.div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 浮动的代码符号 */}
        {DECORATIVE_SYMBOLS.map((item, index) => (
          <motion.div
            key={item.symbol}
            className="absolute text-6xl text-[var(--primary-color)] opacity-5 font-mono"
            style={{
              left: item.left,
              top: item.top,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.5,
            }}
          >
            {item.symbol}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UndevelopedPage;
