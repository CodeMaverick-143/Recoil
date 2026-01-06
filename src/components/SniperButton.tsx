import { Crosshair, ShieldAlert } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface SniperButtonProps {
    onClick: () => Promise<void>;
    className?: string;
    disabled?: boolean;
}

export function SniperButton({ onClick, className, disabled }: SniperButtonProps) {
    const [lockingOn, setLockingOn] = useState(false);

    const handleClick = async () => {
        if (disabled || lockingOn) return;

        setLockingOn(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            await onClick();
        } finally {
            setLockingOn(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || lockingOn}
            className={clsx(
                "group relative flex items-center justify-center rounded-sm border border-red-900/50 bg-red-950/20 p-2 transition-all hover:bg-red-900/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50",
                className
            )}
            title="Terminate Process"
        >
            <div className={clsx(
                "absolute inset-0 scale-[0.8] opacity-0 transition-all duration-300 md:group-hover:scale-100 md:group-hover:opacity-100",
                lockingOn && "animate-ping opacity-100"
            )}>
                <Crosshair className="h-full w-full text-red-500" strokeWidth={1} />
            </div>

            {lockingOn ? (
                <Crosshair className="h-4 w-4 animate-spin text-red-500" />
            ) : (
                <ShieldAlert className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-200" />
            )}
        </button>
    );
}
