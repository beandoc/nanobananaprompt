"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute z-[100] bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-2xl whitespace-nowrap pointer-events-none"
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
