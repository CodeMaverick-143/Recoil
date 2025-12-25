use netstat2::{get_sockets_info, AddressFamilyFlags, ProtocolFlags, ProtocolSocketInfo};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::Mutex;
use std::time::Instant;
use sysinfo::{Pid, System, Uid};
use tauri::State;

// Import nix for Unix signal handling
#[cfg(unix)]
use nix::sys::signal::{self, Signal};
#[cfg(unix)]
use nix::unistd::{Pid as NixPid, Uid as NixUid};

struct AppState {
    system: Mutex<System>,
}

#[derive(Serialize, Clone, Debug)]
struct PortInfo {
    port: u16,
    protocol: String,
    pid: Option<u32>,
    process_name: Option<String>,
    memory: Option<u64>,
    platform: String,
    is_system: bool,
    is_protected: bool,
    user: Option<String>,
    requires_elevation: bool,
}

#[derive(Serialize)]
struct ScanResult {
    ports: Vec<PortInfo>,
    scan_duration_ms: u64,
}

#[derive(Serialize)]
struct KillResult {
    success: bool,
    message: Option<String>,
}

#[derive(Deserialize, Debug)]
enum KillMode {
    Graceful, // SIGTERM
    Force,    // SIGKILL
}

// Helper to safely get process name string
fn get_process_name_str(process: &sysinfo::Process) -> String {
    process.name().to_string_lossy().into_owned()
}

fn is_system_process(pid: u32, name: Option<&str>) -> bool {
    // Basic heuristics for system processes on macOS/Linux
    if pid < 100 {
        return true;
    }
    if let Some(n) = name {
        let system_names = [
            // macOS
            "launchd",
            "kernel_task",
            "syslogd",
            "UserEventAgent",
            "coreaudiod",
            "WindowServer",
            "loginwindow",
            "dockerd",
            "com.docker.backend",
            // Linux
            "systemd",
            "init",
            "kthreadd",
            "containerd",
            // Windows
            "explorer.exe",
            "winlogon.exe",
            "services.exe",
            "csrss.exe",
            "svchost.exe",
        ];
        if system_names.iter().any(|&s| n.contains(s)) {
            return true;
        }
    }
    false
}

fn is_protected_process(_pid: u32, name: Option<&str>, is_system: bool) -> bool {
    if is_system {
        return true;
    }
    // Protect Recoil itself
    if let Some(n) = name {
        if n.contains("recoil") || n.contains("Recoil") {
            return true;
        }
    }
    false
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn scan_ports(state: State<AppState>) -> ScanResult {
    let start_time = Instant::now();

    let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
    let proto_flags = ProtocolFlags::TCP | ProtocolFlags::UDP;

    // 1. Get Sockets
    let sockets = match get_sockets_info(af_flags, proto_flags) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to get socket info: {}", e);
            return ScanResult {
                ports: vec![],
                scan_duration_ms: 0,
            };
        }
    };

    // 2. Refresh Process Data (Cached)
    let mut sys = state.system.lock().unwrap();
    sys.refresh_all();

    // Get current user ID for elevation check
    let current_uid = get_current_uid();

    // Cache user names to avoid repeated lookups (though sysinfo might do this internally)
    // sysinfo provides `get_user_by_id` on the System trait/struct? No, usually on users list.
    // For now, we will just rely on `process.user_id()`
    // Note: To get usernames, we need `sys.refresh_users_list()` which can be heavy.
    // Let's do it only if we haven't recently? Or just once at startup?
    // For now, let's skip expensive user list refresh and just use UID comparison if possible,
    // or assume we need to refresh users.
    // Optimization: Since refreshing users is heavy, let's skip it for this iteration and focus on
    // simple `uid != current_uid` logic if we can get `current_uid`.

    let mut port_infos = Vec::new();
    let mut seen_ports = HashSet::new();

    for si in sockets {
        let port = match &si.protocol_socket_info {
            ProtocolSocketInfo::Tcp(tcp) => tcp.local_port,
            ProtocolSocketInfo::Udp(udp) => udp.local_port,
        };

        if seen_ports.contains(&port) {
            continue;
        }
        seen_ports.insert(port);

        let protocol = match &si.protocol_socket_info {
            ProtocolSocketInfo::Tcp(_) => "TCP".to_string(),
            ProtocolSocketInfo::Udp(_) => "UDP".to_string(),
        };

        let pid = si.associated_pids.first().cloned();
        let mut process_name = None;
        let mut memory = None;
        let mut is_system = false;
        let mut is_protected = false;
        let mut platform = "unknown".to_string();
        let mut user = None;
        let mut requires_elevation = false;

        if let Some(p) = pid {
            if let Some(process) = sys.process(Pid::from(p as usize)) {
                let name = get_process_name_str(process);
                process_name = Some(name.clone());
                memory = Some(process.memory());
                platform = "native".to_string();
                is_system = is_system_process(p, Some(&name));
                is_protected = is_protected_process(p, Some(&name), is_system);

                // Privilege Check
                if let Some(uid) = process.user_id() {
                    if let Some(current) = &current_uid {
                        if uid != current {
                            requires_elevation = true;
                        }
                    }
                    // Attempt to resolve username (if we had users loaded)
                    // For now just format the UID as debugging aid or "User X"
                    // Ideally: sys.get_user_by_id(uid).map(|u| u.name())
                    // But we didn't refresh users.
                    // user = Some(format!("{}", uid)); // sysinfo Uid display might vary
                }
            } else {
                is_system = is_system_process(p, None);
                is_protected = is_protected_process(p, None, is_system);
                // If process is gone, maybe it was root? Assume false safe.
            }
        }

        port_infos.push(PortInfo {
            port,
            protocol,
            pid,
            process_name,
            memory,
            platform: if platform == "unknown" {
                "native".to_string()
            } else {
                platform
            },
            is_system,
            is_protected,
            user,
            requires_elevation,
        });
    }

    // Sort by port
    port_infos.sort_by_key(|p| p.port);

    ScanResult {
        ports: port_infos,
        scan_duration_ms: start_time.elapsed().as_millis() as u64,
    }
}

#[tauri::command]
fn kill_process(state: State<AppState>, pid: u32, mode: KillMode) -> KillResult {
    let mut s = state.system.lock().unwrap();
    s.refresh_all(); // Ensure we have latest state

    // 1. Safety Check: Verify PID existence and protection status
    let process = s.process(Pid::from(pid as usize));

    if let Some(proc) = process {
        let name = get_process_name_str(proc);
        let is_sys = is_system_process(pid, Some(&name));
        let is_prot = is_protected_process(pid, Some(&name), is_sys);

        if is_prot {
            return KillResult {
                success: false,
                message: Some(format!(
                    "Refusing to kill protected process: {} (PID: {})",
                    name, pid
                )),
            };
        }
    } else {
        return KillResult {
            success: false,
            message: Some(format!("Process with PID {} not found", pid)),
        };
    }

    // 2. Perform Kill (OS Specific)
    #[cfg(unix)]
    {
        let signal = match mode {
            KillMode::Graceful => Signal::SIGTERM,
            KillMode::Force => Signal::SIGKILL,
        };

        match signal::kill(NixPid::from_raw(pid as i32), signal) {
            Ok(_) => KillResult {
                success: true,
                message: Some(format!("Signal {:?} sent to PID {}", signal, pid)),
            },
            Err(e) => KillResult {
                success: false,
                message: Some(format!("Failed to kill process: {}", e)),
            },
        }
    }

    #[cfg(not(unix))]
    {
        // Fallback for non-unix (e.g. Windows) using sysinfo's kill
        if let Some(proc) = s.process(Pid::from(pid as usize)) {
            if proc.kill() {
                return KillResult {
                    success: true,
                    message: Some("Process killed".to_string()),
                };
            }
        }
        KillResult {
            success: false,
            message: Some("Failed to kill process (windows fallback)".to_string()),
        }
    }
}

// Helper to get current UID
#[cfg(unix)]
fn get_current_uid() -> Option<Uid> {
    let current_uid = NixUid::current().as_raw();
    Uid::try_from(current_uid as usize).ok()
}

#[cfg(not(unix))]
fn get_current_uid() -> Option<Uid> {
    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt::init();

    let system = System::new_all();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            system: Mutex::new(system),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            scan_ports,
            kill_process,
            ping,
            get_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
