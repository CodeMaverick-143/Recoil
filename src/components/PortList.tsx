import { useEffect, useState } from "react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { AnimatePresence } from "framer-motion";
import { PortCard } from "./PortCard";
import { ShieldAlert } from "lucide-react";
import { ProtectedProcessModal } from "./ProtectedProcessModal";
import { ErrorState } from "./ErrorState";

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

interface ScanResult {
    ports: PortInfo[];
    scan_duration_ms: number;
}

export function PortList() {
    const [ports, setPorts] = useState<PortInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ type: 'permission' | 'offline' | 'scan_failed', message?: string } | null>(null);
    const [scanDuration, setScanDuration] = useState<number>(0);

    // Modal State
    const [protectedModal, setProtectedModal] = useState<{ isOpen: boolean; pid: number; name: string } | null>(null);

    const fetchPorts = async () => {
        try {
            setError(null);
            const result = await invoke<ScanResult>("scan_ports");
            setPorts(result.ports);
            setScanDuration(result.scan_duration_ms);
        } catch (err: any) {
            console.error("Failed to fetch ports:", err);
            // Detect error type
            const errMsg = String(err);
            if (errMsg.includes("permission")) {
                setError({ type: 'permission', message: errMsg });
            } else if (errMsg.includes("offline") || errMsg.includes("failed to fetch")) {
                setError({ type: 'offline' });
            } else {
                // Fallback for browser preview (non-Tauri environment) if truly failed
                setPorts([
                    { port: 3000, protocol: "TCP", process_name: "node", pid: 1234, memory: 52428800, platform: "node", is_system: false, is_protected: false, user: "user", requires_elevation: false },
                    { port: 8080, protocol: "TCP", process_name: "python", pid: 5678, memory: 31457280, platform: "python", is_system: false, is_protected: false, user: "user", requires_elevation: false },
                    { port: 5432, protocol: "TCP", process_name: "postgres", pid: 9101, memory: 104857600, platform: "docker", is_system: true, is_protected: true, user: "postgres", requires_elevation: true },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmKill = (pid: number, processName: string, isProtected: boolean) => {
        if (isProtected) {
            setProtectedModal({ isOpen: true, pid, name: processName });
        } else {
            handleKill(pid, false);
        }
    };

    const handleForceKillConfirm = () => {
        if (protectedModal) {
            handleKill(protectedModal.pid, true);
            setProtectedModal(null);
        }
    };

    const handleKill = async (pid: number, force: boolean = false) => {
        // Optimistic update
        const previousPorts = [...ports];
        setPorts(ports.filter(p => p.pid !== pid));

        const mode = force ? "Force" : "Graceful";
        const toastId = toast.loading(`${force ? 'Force killing' : 'Killing'} process...`);

        try {
            const result = await invoke<{ success: boolean; message?: string }>("kill_process", {
                pid,
                mode: mode
            });

            if (result.success) {
                toast.success("Process terminated", { id: toastId });
                // Optionally fetchPorts() to be sure
            } else {
                throw new Error(result.message || "Unknown error");
            }
        } catch (error: any) {
            console.error("Kill failed:", error);
            const errMsg = String(error);

            if (errMsg.includes("permission")) {
                toast.error("Permission Denied", { description: "You need admin privileges to kill this process.", id: toastId });
            } else if (errMsg.includes("protected")) {
                toast.error("Protected Process", { description: "Cannot kill this system critical process.", id: toastId });
            } else {
                toast.error("Failed to kill process", { description: errMsg, id: toastId });
            }
            // Revert optimistic update
            setPorts(previousPorts);
        }
    };

    useEffect(() => {
        fetchPorts();
        // Poll every 5 seconds or setup subscription later
        const interval = setInterval(fetchPorts, 3000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return <ErrorState type={error.type} message={error.message} onRetry={fetchPorts} />;
    }

    if (loading && ports.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-50">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Scanning ports...</p>
            </div>
        );
    }

    if (ports.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-emerald-500">
                    <ShieldAlert size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-foreground">No active ports</h3>
                    <p className="text-xs text-muted-foreground mt-1">Your system is clean and compliant. 😌</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
                {ports.map((port) => (
                    <PortCard
                        key={port.pid}
                        data={port}
                        onKill={(pid, force) => {
                            if (force) {
                                // If force is explicitly requested (Shift+Click), bypass logic if not protected?
                                // Or still warn if protected?
                                // Let's check protection.
                                if (port.is_protected) {
                                    setProtectedModal({ isOpen: true, pid, name: port.process_name || 'Unknown' });
                                } else {
                                    handleKill(pid, true);
                                }
                            } else {
                                confirmKill(pid, port.process_name || 'Unknown', port.is_protected);
                            }
                        }}
                    />
                ))}
            </AnimatePresence>

            <ProtectedProcessModal
                isOpen={!!protectedModal}
                processName={protectedModal?.name || ''}
                pid={protectedModal?.pid || 0}
                onClose={() => setProtectedModal(null)}
                onConfirm={handleForceKillConfirm}
            />
        </div>
    );
}
