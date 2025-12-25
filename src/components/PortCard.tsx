import { motion } from "framer-motion";
import { Power } from "lucide-react";

interface PortInfo {
    port: number;
    protocol: string;
    process_name: string | null;
    pid: number | null;
    memory: number | null;
    platform: string;
    is_system: boolean;
    is_protected: boolean;
    user: string | null;
    requires_elevation: boolean;
}

interface PortCardProps {
    data: PortInfo;
    onKill: (pid: number, force: boolean) => void;
}

export function PortCard({ data, onKill }: PortCardProps) {
    const { port, protocol, process_name, pid, memory, platform, is_system, is_protected, requires_elevation } = data;

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case "node": return "JS";
            case "python": return "PY";
            case "docker": return "DK";
            case "rust": return "RS";
            default: return protocol.substring(0, 2);
        }
    };

    const formatMemory = (bytes: number | null) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(0)} MB`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            layout
            className={`group relative border rounded-lg p-3 transition-all duration-200 hover:shadow-lg
                ${is_system ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20' :
                    'bg-card/40 hover:bg-card/60 border-white/5 hover:border-white/10 hover:shadow-primary/5'}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-[10px]
              ${platform === 'node' ? 'bg-green-500/10 text-green-400' :
                                platform === 'python' ? 'bg-blue-500/10 text-blue-400' :
                                    platform === 'docker' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-muted text-muted-foreground'}`}>
                            {getPlatformIcon(platform)}
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-20 blur-md transition-opacity rounded" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground/90">{process_name || "Unknown Process"}</span>
                            <span className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[10px] text-muted-foreground font-mono">:{port}</span>
                            {is_system && <span className="text-[10px] text-amber-500 font-mono border border-amber-500/20 px-1 rounded">SYS</span>}
                            {requires_elevation && !is_system && <span className="text-[10px] text-red-500 font-mono border border-red-500/20 px-1 rounded">ADMIN</span>}
                            {is_protected && !is_system && !requires_elevation && <span className="text-[10px] text-blue-500 font-mono border border-blue-500/20 px-1 rounded">SAFE</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span className="font-mono">PID: {pid || "-"}</span>
                            <span>•</span>
                            <span>{formatMemory(memory)}</span>
                            <span>•</span>
                            <span>{protocol}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        if (pid) {
                            const force = e.shiftKey;
                            onKill(pid, force);
                        }
                    }}
                    disabled={!pid || is_protected}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={!pid ? "No PID available" : requires_elevation ? "Requires Admin Privileges" : is_protected ? "Protected Process" : "Click to Kill (Shift+Click to Force)"}
                >
                    <Power size={14} />
                </button>
            </div>

            {/* Crosshair corners on hover */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}
