import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ProtectedProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    processName: string;
    pid: number;
}

export function ProtectedProcessModal({ isOpen, onClose, onConfirm, processName, pid }: ProtectedProcessModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 rounded-[12px]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            className="bg-[#18181B] border border-white/10 w-[90%] max-w-sm rounded-xl p-6 shadow-2xl pointer-events-auto"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-amber-500" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[#F0F0F0]">Protected Process</h3>
                                    <p className="text-sm text-[#A0A0A0] mt-1 leading-relaxed">
                                        This process is critical. Force killing it may affect your system stability.
                                    </p>

                                    <div className="mt-4 bg-white/5 rounded-lg p-3 text-xs font-mono border border-white/5">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Process</span>
                                            <span className="text-foreground">{processName}</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-muted-foreground">PID</span>
                                            <span className="text-foreground">{pid}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors shadow-sm"
                                >
                                    Force Kill
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
