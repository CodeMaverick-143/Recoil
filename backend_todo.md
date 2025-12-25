## 0. Project Setup

- [x] Create Rust workspace (`core/`)
- [x] Setup crates:
  - [x] `sysinfo`
  - [x] `netstat2`
  - [x] `serde`
  - [x] `serde_json`
  - [x] `thiserror`
  - [x] `tracing`
- [x] Setup logging (`tracing_subscriber`)
- [ ] Setup feature flags per OS
- [x] Setup CI formatting + clippy

---

## 1. Core Domain Models

- [x] Define `PortInfo`
  - [x] port: u16
  - [x] protocol: TCP / UDP
  - [x] pid: Option<u32>
  - [x] process_name: Option<String>
  - [x] memory_mb: Option<u64>
  - [x] is_system: bool
  - [x] is_protected: bool
- [x] Define `KillResult`
  - [x] pid (implicit in request)
  - [x] success
  - [x] error (optional)
- [x] Define `ScanResult`
  - [x] Vec<PortInfo>
  - [x] scan_duration_ms

---

## 2. Port Scanner

- [x] Implement TCP/UDP port scan
- [x] Map port → inode / socket
- [x] Map socket → PID
- [x] Resolve PID → process info
- [x] Filter duplicates
- [x] Sort by port number
- [x] Mark system processes
- [x] Handle permission denied gracefully

---

## 3. Kill Engine

- [x] Implement `kill_pid(pid)`
  - [x] Mode::Graceful (SIGTERM)
  - [x] Mode::Force (SIGKILL)
- [x] OS-specific implementations:
  - [x] macOS/Linux → `nix::sys::signal`
  - [ ] Windows → `TerminateProcess`
- [x] Validate PID exists before killing
- [x] Prevent killing Recoil itself
- [x] Block killing critical system processes
- [x] Return structured result

---

## 4. Safety Layer

- [ ] Build allowlist/denylist for protected processes
- [x] Detect Docker, systemd, launchd, explorer.exe, etc.
- [x] Add "danger score" heuristic
- [x] Require explicit force flag for dangerous kills

---

## 5. Tauri IPC API

- [x] Expose `scan_ports()` command
- [x] Expose `kill_process(pid)` command
- [x] Expose `ping()` health check
- [x] Expose `get_version()`

---

## 6. Privileged Helper (Optional)

- [x] Detect if kill requires elevation
- [ ] Implement helper binary (setuid / admin)
- [ ] Secure IPC between app and helper
- [ ] Verify request origin

---

## 7. Performance

- [ ] Scan under 200ms on 500+ ports
- [x] Cache process list per scan
- [ ] Avoid blocking UI thread
- [ ] Throttle auto-refresh

---

## 8. Logging & Observability

- [ ] Log scan duration
- [ ] Log kill attempts
- [ ] Log permission failures
- [ ] Debug mode flag

---

## 9. Cross-Platform Support

- [x] macOS implementation
- [ ] Windows implementation
- [ ] Linux implementation
- [ ] Platform-specific tests

---

## 10. Error Handling

- [x] Unified error enum
- [ ] Map OS errors to human messages
- [ ] Never crash on scan
- [ ] Kill failure must not break scanner

---

## 11. Tests

- [ ] Unit tests for mapping logic
- [ ] Integration test with dummy process
- [ ] Permission failure test
- [ ] Kill self-protection test

---

## 12. Security

- [ ] Validate PID ownership
- [ ] Prevent arbitrary signal injection
- [ ] Harden IPC endpoints
- [ ] Code audit pass

---

## 13. Build & Distribution

- [ ] Build scripts per OS
- [ ] Strip binaries
- [ ] Sign macOS app
- [ ] Windows installer
- [ ] Versioning scheme
