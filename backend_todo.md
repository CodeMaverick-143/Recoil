## 0. Project Setup

- [ ] Create Rust workspace (`core/`)
- [ ] Setup crates:
  - [ ] `sysinfo`
  - [ ] `netstat2` or `socket2`
  - [ ] `serde`
  - [ ] `serde_json`
  - [ ] `thiserror`
  - [ ] `tracing`
- [ ] Setup logging (`tracing_subscriber`)
- [ ] Setup feature flags per OS
- [ ] Setup CI formatting + clippy

---

## 1. Core Domain Models

- [ ] Define `PortInfo`
  - [ ] port: u16
  - [ ] protocol: TCP / UDP
  - [ ] pid: Option<u32>
  - [ ] process_name: Option<String>
  - [ ] memory_mb: Option<f32>
  - [ ] is_system: bool
  - [ ] is_protected: bool
- [ ] Define `KillResult`
  - [ ] pid
  - [ ] success
  - [ ] error (optional)
- [ ] Define `ScanResult`
  - [ ] Vec<PortInfo>
  - [ ] scan_duration_ms

---

## 2. Port Scanner

- [ ] Implement TCP/UDP port scan
- [ ] Map port → inode / socket
- [ ] Map socket → PID
- [ ] Resolve PID → process info
- [ ] Filter duplicates
- [ ] Sort by port number
- [ ] Mark system processes
- [ ] Handle permission denied gracefully

---

## 3. Kill Engine

- [ ] Implement `kill_pid(pid, mode)`
  - [ ] Mode::Graceful (SIGTERM)
  - [ ] Mode::Force (SIGKILL)
- [ ] OS-specific implementations:
  - [ ] macOS/Linux → `nix::sys::signal`
  - [ ] Windows → `TerminateProcess`
- [ ] Validate PID exists before killing
- [ ] Prevent killing Recoil itself
- [ ] Block killing critical system processes
- [ ] Return structured result

---

## 4. Safety Layer

- [ ] Build allowlist/denylist for protected processes
- [ ] Detect Docker, systemd, launchd, explorer.exe, etc.
- [ ] Add "danger score" heuristic
- [ ] Require explicit force flag for dangerous kills

---

## 5. Tauri IPC API

- [ ] Expose `scan_ports()` command
- [ ] Expose `kill_process(pid, mode)` command
- [ ] Expose `ping()` health check
- [ ] Expose `get_version()`

---

## 6. Privileged Helper (Optional)

- [ ] Detect if kill requires elevation
- [ ] Implement helper binary (setuid / admin)
- [ ] Secure IPC between app and helper
- [ ] Verify request origin

---

## 7. Performance

- [ ] Scan under 200ms on 500+ ports
- [ ] Cache process list per scan
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

- [ ] macOS implementation
- [ ] Windows implementation
- [ ] Linux implementation
- [ ] Platform-specific tests

---

## 10. Error Handling

- [ ] Unified error enum
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
