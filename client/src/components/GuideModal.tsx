import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LegendContent } from './LegendRegistry';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
    const { t } = useTranslation();

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full max-w-5xl h-full max-h-[85vh] flex flex-col bg-[#FFFFF0] rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border-2 border-royal-gold/60"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="shrink-0 flex items-center justify-between px-8 py-5 bg-royal-ebony border-b-2 border-royal-gold/40">
                            <div className="flex flex-col">
                                <span className="text-royal-gold font-serif text-[10px] uppercase tracking-[0.4em] font-bold opacity-80">
                                    {t('legend.registry_subtitle', 'TOME OF KNOWLEDGE')}
                                </span>
                                <h2 className="text-royal-ivory font-serif text-2xl tracking-[0.2em] font-medium uppercase drop-shadow-sm">
                                    {t('legend.registry_title', 'Legend & Instructions')}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/10 rounded-full transition-all text-royal-gold cursor-pointer hover:scale-110 active:scale-95"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FFFFF0]">
                            <LegendContent />
                        </div>

                        {/* Footer Decorative Trim */}
                        <div className="shrink-0 h-6 bg-royal-ebony flex items-center justify-center border-t-2 border-royal-gold/20">
                            <div className="w-32 h-[1px] bg-royal-gold/30" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
