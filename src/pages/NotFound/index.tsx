import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { routes } from "../../router/routes";
import FuzzyText from "../../components/Motion/FuzzyText";
import TrueFocusText from "../../components/Motion/TrueFocusText";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)] px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <FuzzyText text="404" className="text-5xl font-bold tracking-widest" />
            <span className="text-3xl">:(</span>
          </div>
          <p className="text-xs text-[var(--text-color-secondary)]">
            抱歉，似乎出现了一点小意外…
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-1"
        >
          <TrueFocusText
            text="页面"
            className="text-sm tracking-[0.3em]"
          />
          <TrueFocusText
            text="找不到了..."
            className="text-lg font-semibold"
            delay={0.15}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <Button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] text-sm bg-[var(--bg-elevated)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            variant="bordered"
            onPress={() => navigate(routes.home)}
          >
            <FiArrowLeft className="text-base" />
            返回首页
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFoundPage;
