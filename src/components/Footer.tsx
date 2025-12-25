interface FooterProps {
    onOpenSettings: () => void;
}

export function Footer({ onOpenSettings }: FooterProps) {
    return (
        <footer className="h-10 border-t border-border flex items-center justify-between px-4 shrink-0 bg-background/50 text-[10px] text-muted-foreground">
            <span>v0.1.0</span>
            <button
                onClick={onOpenSettings}
                className="hover:text-foreground transition-colors"
            >
                Settings
            </button>
        </footer>
    );
}
