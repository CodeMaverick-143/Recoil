import { RefreshCw } from "lucide-react";

interface HeaderProps {
    status: "idle" | "active";
    onRefresh: () => void;
}

export function Header({ status, onRefresh }: HeaderProps) {
    return (
        <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
                <div
                    className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] transition-colors duration-300 ${status === "active"
                            ? "bg-red-500 shadow-red-500/40"
                            : "bg-emerald-500 shadow-emerald-500/40"
                        }`}
                />
                <span className="font-semibold text-sm tracking-tight text-foreground/90">Recoil</span>
            </div>
            <button
                onClick={onRefresh}
                className="p-1.5 hover:bg-white/5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
                <RefreshCw size={14} />
            </button>
        </header>
    );
}
