"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export default function Modal({ open, onClose, title, children, footer, width = "max-w-lg" }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${width} max-h-[90vh] flex flex-col bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl`}
          >
            {/* Fixed header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

            {/* Fixed footer (action buttons) */}
            {footer && (
              <div className="px-6 py-4 border-t border-[var(--border)] shrink-0 bg-[var(--card-bg)] rounded-b-2xl">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
