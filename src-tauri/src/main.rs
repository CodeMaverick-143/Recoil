#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn list_ports() -> Vec<(String, String, String, String)> {
    let output = Command::new("lsof")
        .args(["-i", "-P", "-n"])
        .output()
        .expect("Failed to run lsof");

    let text = String::from_utf8_lossy(&output.stdout);
    let mut results = Vec::new();

    for line in text.lines().skip(1) {
        let cols: Vec<&str> = line.split_whitespace().collect();
        if cols.len() < 9 {
            continue;
        }

        let process = cols[0].to_string();
        let pid = cols[1].to_string();
        let protocol = cols[7].to_string();
        let name = cols[8];

        if !name.starts_with("127.0.0.1:")
            && !name.starts_with("[::1]:")
            && !name.starts_with("localhost:")
        {
            continue;
        }

        if let Some(port) = name.split(':').last() {
            results.push((port.to_string(), protocol, process, pid));
        }
    }

    results
}

#[tauri::command]
fn kill_pid(pid: String) -> Result<(), String> {
    let status = Command::new("kill")
        .args(["-9", &pid])
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
        .invoke_handler(tauri::generate_handler![list_ports, kill_pid])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
