import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Activity, Wifi, Cpu, Terminal } from "lucide-react";
import { SniperButton } from "./components/SniperButton";
import { TelemetryBar } from "./components/TelemetryBar";

interface PortInfo {
  pid: number;
  name: string;
  port: number;
  protocol: string;
}

export default function App() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();


  const { data: ports = [], isLoading } = useQuery<PortInfo[]>({
    queryKey: ["active_ports"],
    queryFn: async () => await invoke("get_active_ports"),
    refetchInterval: 2000,
  });


  const killMutation = useMutation({
    mutationFn: async (pid: number) => {
      await invoke("kill_process", { pid });
    },
    onSuccess: (_, pid) => {
      queryClient.invalidateQueries({ queryKey: ["active_ports"] });

      console.log(`Target neutralized: PID ${pid}`);
    },
    onError: (error) => {
      console.error("Failed to eliminate target:", error);
      alert("Mission Failed: Could not terminate process.");
    }
  });

  const filteredPorts = ports.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.port.toString().includes(term) ||
      p.pid.toString().includes(term)
    );
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-slate-100 font-sans selection:bg-red-900/30 selection:text-red-100">
      <div className="relative z-10 border-b border-white/5 bg-slate-900/50 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded bg-red-500/10 p-2 ring-1 ring-red-500/20">
              <Activity className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">RECOIL</h1>
              <p className="text-xs font-mono text-slate-500">SYSTEM_TRAY // ACTIVE_RECOIL</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            ONLINE
          </div>
        </div>
      </div>

      <div className="border-b border-white/5 bg-slate-900/30 p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-red-400" />
          <input
            type="text"
            placeholder="Search by PID, Name, or Port..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-slate-950/50 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none ring-1 ring-transparent transition-all focus:border-red-900/50 focus:bg-slate-950 focus:ring-red-500/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading && ports.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-600">
            <Activity className="h-8 w-8 animate-pulse text-red-900" />
            <span className="font-mono text-xs tracking-widest">INITIALIZING_SCAN...</span>
          </div>
        ) : filteredPorts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
            <Terminal className="h-8 w-8 opacity-20" />
            <span className="font-mono text-xs">NO_TARGETS_FOUND</span>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredPorts.map((port) => (
              <div
                key={`${port.pid}-${port.port}`}
                className="group relative flex items-center justify-between rounded-md border border-white/5 bg-slate-800/20 p-3 transition-all hover:bg-slate-800/40 hover:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded bg-slate-900 font-mono text-xs font-bold text-slate-500 ring-1 ring-white/5 group-hover:text-slate-300">
                    {port.protocol}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200 group-hover:text-white flex items-center gap-2">
                      {port.name}
                      <span className="inline-flex items-center rounded-full bg-slate-900/50 px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-white/5">
                        {port.pid}
                      </span>
                    </h3>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        Localhost
                      </span>
                      <span className="flex items-center gap-1 font-mono text-red-300/80">
                        <Wifi className="h-3 w-3" />
                        :{port.port}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SniperButton
                    onClick={() => killMutation.mutateAsync(port.pid)}
                    disabled={killMutation.isPending}
                  />
                </div>

                <div className="absolute -left-px -top-px h-2 w-2 border-l border-t border-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-slate-950 px-4 py-2">
        <TelemetryBar />
      </div>
    </div>
  );
}
