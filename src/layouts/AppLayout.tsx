import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black/80 text-foreground selection:bg-primary/20">
      {/* 
        This wrapper simulates the app window constraints if running in a larger browser window,
        but for Tauri we often want the body to be the window. 
        However, based on the requirements: "Fixed width (≈ 380–420px)" and "Rounded corners",
        it sounds like the UI itself has these properties, or maybe the window is transparent.
        I will assume standard window for now but create a container that looks like the designs.
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full h-full max-w-[420px] max-h-[800px] bg-background/95 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col relative sm:rounded-xl"
      >
        {children}
      </motion.div>
    </div>
  );
}
