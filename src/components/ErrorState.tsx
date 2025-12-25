import { AlertTriangle, RefreshCcw, ShieldAlert, WifiOff } from "lucide-react";

type ErrorType = 'permission' | 'offline' | 'scan_failed' | 'backend_error';

interface ErrorStateProps {
    type: ErrorType;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ type, message, onRetry }: ErrorStateProps) {
    const getContent = () => {
        switch (type) {
            case 'permission':
                return {
                    icon: ShieldAlert,
                    title: "Permission Required",
                    desc: message || "Recoil needs system permission to inspect ports.",
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                    action: "Grant Permission"
                };
            case 'offline':
                return {
                    icon: WifiOff,
                    title: "Backend Offline",
                    desc: "Recoil engine is not responding. Trying to reconnect...",
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                    action: null
                };
            case 'scan_failed':
            default:
                return {
                    icon: AlertTriangle,
                    title: "Scan Failed",
                    desc: message || "Unable to fetch port information.",
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    action: "Retry Scan"
                };
        }
    };

    const content = getContent();
    const Icon = content.icon;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className={`w-16 h-16 rounded-2xl ${content.bg} flex items-center justify-center mb-4 ring-1 ring-white/5`}>
                <Icon className={content.color} size={32} strokeWidth={1.5} />
            </div>

            <h3 className="text-lg font-medium text-[#F0F0F0]">{content.title}</h3>
            <p className="text-sm text-[#A0A0A0] mt-2 max-w-[240px] leading-relaxed">
                {content.desc}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#F0F0F0] text-[#121212] rounded-lg text-sm font-medium hover:bg-white transition-colors active:scale-95"
                >
                    {type === 'scan_failed' && <RefreshCcw size={14} />}
                    {content.action || "Retry"}
                </button>
            )}
        </div>
    );
}
