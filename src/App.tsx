import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type Port = [string, string, string, string];

export default function App() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [search, setSearch] = useState("");

  const loadPorts = async () => {
    try {
      const data = await invoke<Port[]>("list_ports");
      setPorts(data);
    } catch (error) {
      console.error("Failed to load ports:", error);
    }
  };

  const kill = async (pid: string, name: string) => {
    if (confirm(`Are you sure you want to kill process ${name} (PID: ${pid})?`)) {
      try {
        await invoke("kill_pid", { pid });
        await loadPorts();
      } catch (error) {
        console.error("Failed to kill process:", error);
        alert("Failed to kill process. Check console for details.");
      }
    }
  };

  useEffect(() => {
    loadPorts();
    const interval = setInterval(loadPorts, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredPorts = ports.filter(
    ([port, protocol, process, pid]) =>
      port.includes(search) ||
      process.toLowerCase().includes(search.toLowerCase()) ||
      pid.includes(search)
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Port Killer</h1>
        <p className="subtitle">Monitor and terminate active ports</p>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by Port, PID, or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button onClick={loadPorts} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Port</th>
              <th>Protocol</th>
              <th>Process</th>
              <th>PID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPorts.length > 0 ? (
              filteredPorts.map(([port, protocol, process, pid]) => (
                <tr key={`${port}-${pid}`}>
                  <td className="port-cell">{port}</td>
                  <td><span className={`badge ${protocol.toLowerCase()}`}>{protocol}</span></td>
                  <td className="process-cell">{process}</td>
                  <td className="pid-cell">{pid}</td>
                  <td>
                    <button
                      onClick={() => kill(pid, process)}
                      className="kill-btn"
                      title="Kill Process"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-state">
                  {ports.length === 0 ? "Scanning ports..." : "No matching ports found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
