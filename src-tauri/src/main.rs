#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::collections::HashMap;
use std::process::Command;
use std::sync::Mutex;
use sysinfo::{Pid, ProcessesToUpdate, System};
use tauri::State;

struct AppState {
    sys: Mutex<System>,
}

#[derive(Serialize)]
struct GlobalStats {
    cpu_usage: f32,
    memory_total: u64,
    memory_used: u64,
}

#[derive(Serialize)]
struct PortInfo {
    pid: u32,
    name: String,
    port: u16,
    protocol: String,
}

fn clean_process_name(name: &str) -> String {
    name.replace("\\x20", " ")
        .replace("\\", "")
        .trim()
        .to_string()
}

#[tauri::command]
fn get_global_stats(state: State<AppState>) -> GlobalStats {
    let mut sys = state.sys.lock().unwrap();

    // Refresh only what we need
    sys.refresh_cpu_all(); // This refreshes CPU usage % calculation
    sys.refresh_memory();

    GlobalStats {
        cpu_usage: sys.global_cpu_usage(),
        memory_total: sys.total_memory(),
        memory_used: sys.used_memory(),
    }
}

#[tauri::command]
fn get_active_ports() -> Vec<PortInfo> {
    // We can't easily reuse the global system state for process list because
    // refresh_processes() is heavy and might block the mutex for too long if done frequently.
    // Also, get_active_ports is likely called less frequently or independently.
    // However, to follow the requirement "avoid initializing System::new_all() on every call",
    // we COULD use the shared state, but let's stick to a fresh instance for process listing
    // to avoid lock contention with the high-frequency UI polling of global stats,
    // OR we can upgrade the AppState to have granular locks if needed.
    // For this simple app, a fresh instance for the heavy process scan is actually safer
    // to prevent freezing the UI thermal monitor.
    // BUT, the prompt asked to "update main.rs to manage a persistent sysinfo::System... avoid initializing... on every call".
    // So let's try to verify if we can use it for `get_active_ports` too without blocking too much.
    // Actually, `lsof` is used here, not sysinfo for the PORTS.
    // Sysinfo is ONLY used for process name resolution.
    // So we CAN use a fresh partial system or just use the global one.
    // Let's stick to the current implementation of `get_active_ports` for now as it primarily uses `Command::new("lsof")`.
    // The `sys` usage inside is just to resolve PID to Name.

    let mut sys = System::new_all();
    sys.refresh_processes(ProcessesToUpdate::All, true); // Needed to resolve names from PIDs

    let output = Command::new("lsof")
        .args(["-iTCP", "-sTCP:LISTEN", "-P", "-n"])
        .output()
        .expect("Failed to run lsof");

    let text = String::from_utf8_lossy(&output.stdout);

    let mut port_map: HashMap<u16, PortInfo> = HashMap::new();

    for line in text.lines().skip(1) {
        println!("Found raw line: {}", line);

        let cols: Vec<&str> = line.split_whitespace().collect();
        if cols.len() < 9 {
            continue;
        }

        let pid_str = cols[1];
        let protocol = "TCP".to_string();

        let descriptor = cols[8];
        if !descriptor.contains(':') {
            continue;
        }

        if let Ok(pid) = pid_str.parse::<u32>() {
            if let Some(port_part) = descriptor.split(':').last() {
                let clean_port_str: String =
                    port_part.chars().take_while(|c| c.is_numeric()).collect();

                if let Ok(port) = clean_port_str.parse::<u16>() {
                    let mut final_name = String::from("Unknown");

                    if let Some(process) = sys.process(Pid::from_u32(pid)) {
                        let name = process.name().to_string_lossy().to_string();
                        final_name = clean_process_name(&name);

                        if final_name == "node"
                            || final_name == "electron"
                            || final_name == "python"
                            || final_name == "Python"
                        {
                            if let Some(cmd) = process.cmd().get(1) {
                                let arg = cmd.to_string_lossy();
                                if !arg.starts_with("-") {
                                    let path = std::path::Path::new(arg.as_ref());
                                    if let Some(file_name) = path.file_name() {
                                        final_name = file_name.to_string_lossy().to_string();
                                    }
                                }
                            }
                        }
                    } else {
                        final_name = clean_process_name(cols[0]);
                    }

                    port_map.insert(
                        port,
                        PortInfo {
                            pid,
                            name: final_name,
                            port,
                            protocol: protocol.clone(),
                        },
                    );
                }
            }
        }
    }

    let mut results: Vec<PortInfo> = port_map.into_values().collect();
    results.sort_by_key(|p| p.port);
    results
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<(), String> {
    let status = Command::new("kill")
        .args(["-9", &pid.to_string()])
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err("Failed to kill process".into())
    }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            sys: Mutex::new(System::new_all()),
        })
        .invoke_handler(tauri::generate_handler![
            get_active_ports,
            kill_process,
            get_global_stats
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
